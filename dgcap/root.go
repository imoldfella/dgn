package dgcap

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/json"
	"os"
	"path"
	"time"
)

// generate a root keypair and a host keypair.
func generateRoot(dir string) error {
	var config CapDbConfig
	// create a mnemonic
	mn, e := Bip39()
	if e != nil {
		return e
	}
	os.WriteFile(path.Join(dir, "/root.txt"), []byte(mn), 0644)

	// create a keypair from the mnemonic

	root, e := NewIdentityFromSeed(mn)
	if e != nil {
		return e
	}
	host, e := NewKeypair()
	host.WriteFile(path.Join(dir, "/host.key"))
	if e != nil {
		return e
	}
	var commit [32]byte
	_, e = rand.Read(commit[:])
	if e != nil {
		return e
	}
	c2 := sha256.Sum256(commit[:])
	gr := GrantData{
		To:         host.Public,
		Commitment: c2[:],
		NotBefore:  uint64(time.Now().Unix()),
		NotAfter:   uint64(time.Now().Add(365 * 24 * time.Hour).Unix()),
		Can:        0,
		Signature:  []byte{},
	}

	pr := &Proof{
		Version: 0,
		Root:    root.Public,
		Grant:   []GrantData{gr},
	}
	_ = pr

	b, e := json.Marshal(&config)
	if e != nil {
		return e
	}
	os.WriteFile(path.Join(dir, "/index.jsonc"), b, 0644)
	return nil
}

// allocate a
