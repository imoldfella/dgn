package dgcap

import (
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

	// create a mnemonic
	mn, e := Bip39()
	if e != nil {
		t.Fatal(e)
	}
	// create a keypair from the mnemonic
	root, e := NewIdentityFromSeed(mn)
	if e != nil {
		t.Fatal(e)
	}
	rootPub := root.Public

	var x []Keypair = []Keypair{root}
	for i := 0; i < 5; i++ {
		k, e := NewKeypair()
		if e != nil {
			t.Fatal(e)
		}
		x = append(x, k)
	}

	pr := Proof{}
	for i := 0; i < len(x)-1; i++ {
		pr, e = Grant(root, &pr, rootPub, "host", 365*24*time.Hour)
		if e != nil {
			t.Fatal(e)
		}
	}

	// verify checks that there is a valid path from the root to the target that includes the requested capability.
	ok := Verify(&pr, rootPub, "host")
	if !ok {
		t.Fatal("failed to verify")
	}

}

func NewToken(from Keypair, to Keypair, cap string, exp uint64) (*AccessProof, error) {
	return nil, nil
}
func Test_make(t *testing.T) {
	challenge := []byte("hello world")

	root, e := NewKeypair()
	if e != nil {
		t.Fatal(e)
	}

	tok, e := NewOwnerProof(root, challenge)
	if e != nil {
		t.Fatal(e)
	}

	admin, e := NewKeypair()
	if e != nil {
		t.Fatal(e)
	}
	Grant := func(from Keypair, to Keypair, cap string, exp uint64) (*AccessProof, error) {
		return nil, nil
	}
	adminTok, e := Grant(root, admin, "admin", 0)

	_ = tok
	_ = adminTok

}

func Test_keypair(t *testing.T) {
	root, e := NewKeypair()
	if e != nil {
		t.Fatal(e)
	}
	challenge := []byte("hello world")
	Sign := func(privkey []byte, challenge []byte) []byte {
		return nil
	}
	sig := Sign(root.Private, challenge)
	_ = sig

	// if !Verify(root.Pubkey, challenge, sig) {
	// 	t.Fatal("failed to verify")
	// }

	// if !Authorize(tok, root.Pubkey, "admin") {
	// 	t.Fatal("failed to authorize")
	// }
}
