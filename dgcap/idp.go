package dgcap

import (
	"crypto/ed25519"
	"os"

	"github.com/fxamacker/cbor"
	"github.com/tyler-smith/go-bip39"
)

type Keypair struct {
	Version int    `json:"version,omitempty"`
	Public  []byte `json:"public,omitempty"`
	Private []byte `json:"private,omitempty"`
}

func (k *Keypair) WriteFile(path string) error {
	b, e := os.ReadFile(path)
	if e != nil {
		return e
	}
	return cbor.Unmarshal(b, k)
}
func (k *Keypair) ReadFile(path string) error {
	b, e := cbor.Marshal(k)
	if e != nil {
		return e
	}
	return os.WriteFile(path, b, 0644)
}
func NewKeypair() (Keypair, error) {
	pub, priv, e := ed25519.GenerateKey(nil)
	if e != nil {
		return Keypair{}, e
	}
	return Keypair{
		Public:  pub,
		Private: priv,
	}, nil
}

// return a keypair
func NewIdentityFromSeed(mnemonic string) (Keypair, error) {
	seed := bip39.NewSeed(mnemonic, "Secret Passphrase")

	key := ed25519.NewKeyFromSeed(seed[0:ed25519.SeedSize])

	return Keypair{
		Private: key,
		Public:  key.Public().(ed25519.PublicKey),
	}, nil
}
func Bip39() (string, error) {
	// Generate a mnemonic for memorization or user-friendly seeds
	entropy, e := bip39.NewEntropy(256)
	if e != nil {
		return "", e
	}
	mnemonic, e := bip39.NewMnemonic(entropy)
	if e != nil {
		return "", e
	}
	return mnemonic, nil

	// Generate a Bip32 HD wallet for the mnemonic and a user supplied password
	// seed := bip39.NewSeed(mnemonic, "Secret Passphrase")

	// masterKey, _ := bip32.NewMasterKey(seed)
	// publicKey := masterKey.PublicKey()
}
