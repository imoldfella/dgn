package dgcap

import (
	"crypto/ed25519"
	"crypto/sha256"
	"encoding/binary"
	"encoding/json"
	"os"
	"path"
	"strconv"
	"strings"
	"sync"
	"sync/atomic"

	"github.com/o1egl/paseto/v2"
	cuckoo "github.com/seiflotfy/cuckoofilter"
)

// this is a serial number assigned at creation along with its key pair. This makes creation a little more complex, but accelerates operations on records.
// A dbid combines a serial number assigned by the host with a key pair generated by the client. 40 bytes: 8 bytes LE serial number, 32 bytes public key. This would mean validation always requires a lookup though? The core server will know because of tokens, but auditors can't trust the tokens. It's not clear that auditors want to take the time to validate every record (checking proof) though. What about fastver?

type CapDbConfig struct {
}

// we need a database so that we can revoke grants. We can use a simple database that stores the revoked serial numbers. We can also use a cuckoo filte
type CapDb struct {
	CapDbConfig
	Serial     uint64
	RootPublic []byte
	Host       Keypair
	secret     sync.Map
	filter     *cuckoo.Filter
	store      CapStore
	HostProof  *Proof
}

// the refresh token contains all keys used to validate the token when it was issue. If none of these have been revoked, then the token is valid.
// take a refresh token and return a new active token and a new refresh token

func NewCapDb(dir string) (*CapDb, error) {
	// there should already be an active host, if not then generate a root and use it to sign a host keypair. Generally you should then delete the root key from any online system.
	var config CapDbConfig
	r := &CapDb{
		secret: sync.Map{},
		filter: cuckoo.NewFilter(1000 * 1000),
		store:  &SimpleCapStore{},
	}

	b, e := os.ReadFile(path.Join(dir, "/index.jsonc"))
	if e != nil {

		if e != nil {
			return nil, e
		}
	} else {
		json.Unmarshal(b, &config)
	}
	return r, nil
}

func (c *CapDb) DecryptToken(token string, out *paseto.JSONToken) error {
	s := strings.Split(token, ",")
	sn, e := strconv.Atoi(s[0])
	if e != nil {
		return e
	}
	return paseto.Decrypt(token, c.GetSecret(uint64(sn)), out, nil)
}

type DbSecret struct {
	Serial uint64
	Secret []byte
}

func (c *CapDb) CurrentSecret() DbSecret {
	return DbSecret{
		Serial: 0,
		Secret: []byte("todo"),
	}
}
func (c *CapDb) GetSecret(sn uint64) []byte {
	return []byte("todo")
}

// we should store top 32 bit, and then use some more logic to make sure this is monotonic.
func (c *CapDb) GetSerialNumber() uint64 {
	o := atomic.AddUint64(&c.Serial, 1)
	return o
}

type Dbid uint64

// Databases are integers that are assigned by the host using a host signature.
type Proof struct {
	// these three values are hashed into each grant.
	// note that dbid is only unique in context of the root key.
	Version int
	Db      uint64
	Schema  uint64

	Root []byte // this must be a root key controlled by the host.
	// the host grant always uses a db of 0, so it can be cached.
	Grant []GrantData // host grants to other keys, eventually to the challenge created by the host.

}

// a revoke is a paseto token that can be used to revoke a grant. These are checked by refresh.

type GrantData struct {
	To         []byte // public key
	Commitment []byte // we can use the hash^-1(Commitment) to revoke.
	NotBefore  uint64
	NotAfter   uint64
	Can        uint64 // db db schema schema write
	Signature  []byte
}

// type Revoke = string // paseto token
// type RevokeData struct {
// 	Serial uint64
// 	Secret []byte
// }

// we have to look up a private key in the key chain.
// we need to look up a proof that allows us to grant the requested capability.
// all proofs start with the root key, but we can cache signatures like the active root->active so we don't have to keep prooving them.

const (
	GrantSize = 88 + 32
)

func MarshalGrant(buf [GrantSize]byte, from []byte, g *GrantData) ([]byte, error) {
	copy(buf[:], from)
	copy(buf[32:], g.To)
	binary.LittleEndian.PutUint64(buf[64:], g.NotBefore)
	binary.LittleEndian.PutUint64(buf[72:], g.NotAfter)
	binary.LittleEndian.PutUint64(buf[80:], g.Can)
	copy(buf[88:], g.Commitment)
	return buf[:], nil
}

// what caps do we need? do we need verify a range of database/schema? a prefix? can I check every assertion at each step that its restricting? Can I return the final cap set? does a return token represent all the capability of the proof, or only the requested parts? We can always modify the proof to reduce the capability.

// an independent commitment allows delegating revoke, but is it worth that?

// grant allows us to create a revocable signature. we could simply sign the signature with the original key. The original key is more dangerous to keep around though? Also using a commitment allows the person to give up their own commit.

// is the capset simply the final approved grant stored in the database by serial number? Also with dependencies, so if we can delete if any dependencies are revoked.
type CapSet struct {
	Db           uint64
	Schema       uint64
	Can          uint64 // write|grant  (always read)
	NotAfter     uint64 // we don't need notBefore, because tokens are never issued preemptively.
	RefreshAfter uint64
	// the token can be used to verify faster than the proof.
	// to make this work we need to store the commitment dependencies of the token. The token then is just a stored capset and a signed serial number. The token must be treated as a secret. By design it can replayed.
	// periodically check that this serial number is still valid.
	Serial uint64
}

func (c *CapDb) Verify(proof *Proof) (*CapSet, error) {
	from := proof.Root
	// we must ensure that capabilities are only narrowed.
	flags := uint64(0xFFFFFFFFFFFFFFFF)

	for _, g := range proof.Grant {
		flags = flags & g.Can
		var buf [GrantSize]byte
		message, e := MarshalGrant(buf, from, &g)
		if e != nil ||
			!ed25519.Verify(from, message, g.Signature) ||
			c.store.IsRevokedSignature(g.Commitment) {
			flags = 0
			break
		}
		from = g.To
	}

	sn := c.GetSerialNumber()
	r := &CapSet{
		Serial: sn,
	}
	for _, g := range proof.Grant {
		c.store.AddDependsOn(g.Commitment, sn)
	}

	return r, nil
}

func (c *CapDb) Revoke(secret []byte) error {
	commitment := sha256.Sum256(secret)
	c.store.Revoke(commitment[:])
	return nil
}

func (c *CapDb) CreateDb(pubkey []byte) (Dbid, error) {
	return 0, nil
}
func (c *CapDb) CreateSchema() (Dbid, error) {
	return 0, nil
}
