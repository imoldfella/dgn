package dgrtc

import (
	"crypto/ed25519"
	"crypto/rand"
	"encoding/binary"
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
	Root      []byte
	Signature [][]byte
	Grant     []string
	To        [][]byte
	Begin     []uint64
	End       []uint64
}
type Keypair struct {
	Pubkey  []byte
	Privkey []byte
}

// authorization is a sorted set of strings x|y|z|...

func Sign(priv []byte, challenge []byte) []byte {
	return ed25519.Sign(priv, challenge)
}
func Verify(public []byte, challenge []byte, sig []byte) bool {
	return ed25519.Verify(public, challenge, sig)
}
func Authorize(tok *Token, pubkey []byte, grant string) bool {
	// the first "to" is the site id.

}

// should we allow the admin key to expire?
func NewSite(site Keypair) *Token {
	return &Token{
		Root: site.Pubkey,
	}
}
func NewToken(signer Keypair, base *Token, to []byte, grant string, begin uint64, end uint64) (*Token, error) {

	r := *base
	r.To = append(r.To, to)
	r.Begin = append(r.Begin, begin)
	r.End = append(r.End, end)
	r.Grant = append(r.Grant, grant)

	// sign the previous signature + time range + to + grant
	b := r.To[len(r.To)-1]
	b = binary.AppendUvarint(b, begin)
	b = binary.AppendUvarint(b, uint64(len(r.End)))
	b = binary.AppendUvarint(b, uint64(len(to)))
	b = append(b, to...)

	sig := ed25519.Sign(signer.Privkey, b)
	r.Signature = append(r.Signature, sig)

	return &r, nil
}

// returns an admin capability and new root keypair.
func NewKeypair() (Keypair, error) {
	pub, priv, e := ed25519.GenerateKey(rand.Reader)
	if e != nil {
		return Keypair{}, e
	}
	r := Keypair{
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
