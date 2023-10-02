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
	Root  []byte // public key associated with database.
	Chain []GrantData
}
type Keypair struct {
	Pubkey  []byte
	Privkey []byte
}
type GrantData struct {
	To        []byte
	Auth      string
	Begin     uint64
	End       uint64
	Signature []byte
}

// authorization is a sorted set of strings x|y|z|...

func Sign(priv []byte, challenge []byte) []byte {
	return ed25519.Sign(priv, challenge)
}
func Verify1(public []byte, challenge []byte, sig []byte) bool {
	return ed25519.Verify(public, challenge, sig)
}

func SignedBlock(d *GrantData) []byte {
	b := d.To
	b = binary.AppendUvarint(b, d.Begin)
	b = binary.AppendUvarint(b, d.End)
	b = append(b, d.Auth...)

	return b
}

// 1. auth must be in the final authorization
// 2. Each signature must be valid
func Verify(tok *Token, pubkey []byte, auth string) bool {

	for i, sig := range tok.Chain {
		blk := tok.SignedBlock(i)
		if !Verify(pubkey, blk, sig) {
			return false
		}

	}

}

// should we allow the admin key to expire?
func NewSite(site Keypair) *Token {
	return &Token{
		Root: site.Pubkey,
	}
}

func (base *Token) Grant(d *GrantData) (*Token, error) {
	r := *base
	r.To = append(r.To, d.To)
	r.Begin = append(r.Begin, d.Begin)
	r.End = append(r.End, d.End)
	r.Auth = append(r.Auth, d.Auth)

	sig := ed25519.Sign(d.Signer.Privkey, b)
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
