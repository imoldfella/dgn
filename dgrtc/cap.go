package dgrtc

import (
	"crypto/ed25519"
	"crypto/rand"
)

// admin/write/read

// type Capability struct {
// 	Pubkey  []byte
// 	Privkey []byte

// 	Channel     []byte // the public key of the channel
// 	IssueTo     []byte // public key of capability
// 	Auth        string
// 	ProofLength int    // if 0, then Proof is a signature, otherwise it is a capability.
// 	Proof       []byte //chain of signatures (and capabilities?)
// }

// an authorization is a signed attenuation.
// the root is always an admin. each signature in the chain must be a valid (not revoked) id.

// the first "to" is the site id.
// the second "to" is the initial admin key

type Token struct {
	Signature [][]byte
	Grant     []string
	To        [][]byte
	Begin     []int64
	End       []int64
}
type Keypair struct {
	Pubkey  []byte
	Privkey []byte
}

// authorization is a sorted set of strings x|y|z|...

func Sign(challenge []byte, kp *Keypair) []byte {
	return nil
}
func Verify(challenge []byte, public []byte) bool {
	return false
}

func NewSite(admin Keypair, site Keypair) (*Token, error) {
	base := &Token{}
	return NewToken(site, base, admin.Pubkey, "admin", 0, 0)
}
func NewToken(signer Keypair, base *Token, to []byte, grant string, begin int64, end int64) (*Token, error) {

	r := *base
	r.To = append(r.To, to)
	r.Begin = append(r.Begin, begin)
	r.End = append(r.End, end)

	r.Grant = append(r.Grant, grant)

	nextBlock := []byte{}

	sig := ed25519.Sign(signer.Privkey, nextBlock)
	r.Signature = append(r.Signature, sig)

	return &r, nil
}

// returns an admin capability and new root keypair.
func NewKeypair() (*Keypair, error) {
	pub, priv, e := ed25519.GenerateKey(rand.Reader)
	if e != nil {
		return nil, e
	}
	r := &Keypair{
		Pubkey:  pub,
		Privkey: priv,
	}
	return r, nil
}

func (c *Token) Marshal() []byte {
	return nil
}

func Unmarshal(data []byte) (*Token, error) {
	return nil, nil
}
