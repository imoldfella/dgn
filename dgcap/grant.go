package dgcap

import (
	"crypto/ed25519"
	"time"
)

// does not need a database, this simply extends the proof.

func Grant(key Keypair, proof *Proof, commit []byte, toPublicKey []byte, can string, dur time.Duration) (*Proof, error) {
	gr := &GrantData{
		To:         toPublicKey,
		NotBefore:  uint64(time.Now().Unix()),
		NotAfter:   uint64(time.Now().Add(dur).Unix()),
		Can:        0,
		Signature:  nil,
		Commitment: commit,
	}

	var buf [GrantSize]byte
	message, e := MarshalGrant(buf, key.Public, gr)
	if e != nil {
		return nil, e
	}

	gr.Signature = ed25519.Sign(key.Private, message)
	proof.Grant = append(proof.Grant, *gr)
	return proof, nil
}
