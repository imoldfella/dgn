package dbhttplib

import (
	"crypto/ed25519"
	"crypto/rand"
	"encoding/binary"
	"time"

	"github.com/fxamacker/cbor/v2"
	"golang.org/x/crypto/chacha20poly1305"
)

// do I need a refresh? can I ratchet a sequence efficiently? would that still require a refresh?

type Login struct {
	PublicKey []byte
	Signature []byte
	Time      int64
}

type Token struct {
	PublicKey []byte
}

func ValidateLogin(data []byte) bool {
	var v Login
	e := cbor.Unmarshal(data, &v)
	if e != nil {
		return false
	}
	// see if time is too old.
	now := time.Now()
	if now.Sub(time.Unix(v.Time, 0)) > 30*time.Second {
		return false
	}

	// see if signature is valid.
	var tm [8]byte
	binary.LittleEndian.PutUint64(tm[:], uint64(v.Time))
	if !ed25519.Verify(v.PublicKey, tm[:], v.Signature) {
		return false
	}

	return true
}

func GenerateSecret() ([]byte, error) {
	key := make([]byte, chacha20poly1305.KeySize)
	_, err := rand.Read(key)
	return key, err
}
func GenerateNonce() ([]byte, error) {
	nonce := make([]byte, chacha20poly1305.NonceSizeX)
	_, err := rand.Read(nonce)
	return nonce, err
}

// return a bearer token that protects a public key or account integer.
func GenerateToken(publicKey []byte, signature []byte, time int64) []byte {
	return nil
}

// return the public key from the token
// note that token needs to start with a nonce, then the rest will be cbor.
func ValidateToken(secret []byte, data []byte) ([]byte, error) {

	// nonce size is 24 bytes
	nonce := make([]byte, chacha20poly1305.NonceSizeX)
	copy(nonce, data[:chacha20poly1305.NonceSizeX])
	ciphertext := data[chacha20poly1305.NonceSizeX:]
	aead, err := chacha20poly1305.NewX(secret)
	if err != nil {
		panic(err)
	}

	plaintext, err := aead.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		panic(err)
	}

	_ = plaintext

	var tk Token
	return tk.PublicKey, nil
}
