package dgrtc

import (
	"crypto/ed25519"
	"crypto/rand"
)

// admin/write/read

type Capability struct {
	Pubkey  []byte
	Privkey []byte

	Channel     []byte // the public key of the channel
	IssueTo     []byte // public key of capability
	Auth        string
	ProofLength int    // if 0, then Proof is a signature, otherwise it is a capability.
	Proof       []byte //chain of signatures (and capabilities?)
}

// an authorization is a signed attenuation.
// the root is always an admin. each signature in the chain must be a valid (not revoked) id.
type Attenuate struct {
	Grant string
	To    []byte
	Begin int64
	End   int64
}
type Signed struct {
	Signer    [][]byte // public key of the signer, DID, might be revoked
	Signature [][]byte
	Content   [][]byte //
}

// authorization is a sorted set of strings x|y|z|...
func RequestProof(challenge []byte, pubkey []byte, auth [][]string) []byte {
	return nil
}
func GenerateProof(challenge []byte, pubkey []byte, auth [][]string) []byte {
	return nil
}
func VerifyProof(challenge []byte, pubkey []byte, proof []byte) bool {
	return false
}

// returns an admin capability and new root keypair.
func NewSite() (*Capability, error) {
	pub, priv, e := ed25519.GenerateKey(rand.Reader)
	if e != nil {
		return nil, e
	}
	r := &Capability{
		Pubkey:  pub,
		Privkey: priv,
	}
	return r, nil
}

func (c *Capability) Marshal() []byte {
	return nil
}

func Unmarshal(data []byte) (*Capability, error) {
	return nil, nil
}
