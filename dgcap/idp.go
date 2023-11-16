package dgcap

import (
	"github.com/tyler-smith/go-bip39"
)

// return a keypair
func NewIdentityFromSeed(bip39 string) (Keypair, error) {

	return Keypair{}, nil
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
