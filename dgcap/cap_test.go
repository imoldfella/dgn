package dgcap

import (
	"crypto/rand"
	"crypto/sha256"
	"log"
	"testing"
	"time"
)

// database users can read or write, with grant or not.
// the active key is used to host databases by signing them.
// admin is always read|write|grant, write implies read.

func Test_one(t *testing.T) {
	// there is a root datagrove keypair, that signs the working key pair.
	// all database proofs start with these two keys.
	// the working keypair is used to sign account keypairs.
	// accounts are funded by digital/untraceable cash.
	// anyone can fund the account to keep the databases created by the account alive/available.
	db, e := NewCapDb(".data")
	if e != nil {
		t.Fatal(e)
	}
	var x []Keypair = []Keypair{}
	for i := 0; i < 5; i++ {
		k, e := NewKeypair()
		if e != nil {
			t.Fatal(e)
		}
		x = append(x, k)
	}

	from := db.Host
	pr := &*db.HostProof

	for i := 0; i < len(x)-1; i++ {
		commit := [32]byte{}
		_, e = rand.Read(commit[:])
		sha := sha256.Sum256(commit[:])

		pr, e = Grant(from, pr, sha[:], x[i].Public, "host", 365*24*time.Hour)
		from = x[i]
		if e != nil {
			t.Fatal(e)
		}
	}

	// verify checks that there is a valid path from the root to the target that includes the requested capability.
	set, e := db.Verify(pr)
	if e != nil {
		t.Fatal("failed to verify")
	}
	log.Printf("verified: %v", set)
}
