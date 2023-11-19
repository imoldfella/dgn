package dgcap

import (
	"testing"
	"time"
)

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

	// create a path, should host root be explicit?
	pr := []Proof{}
	var x []Keypair = []Keypair{root}
	for i := 0; i < 10; i++ {
		k, e := NewKeypair()
		if e != nil {
			t.Fatal(e)
		}
		x = append(x, k)
	}

	// database users can read or write, with grant or not.

	// the active key is used to host databases by signing them.
	pr, e := Grant(root, &Proof{}, active.Pubkey, "host", 365*24*time.Hour)
	if e != nil {
		t.Fatal(e)
	}

	ac, e := Grant(active, &pr, account.Pubkey, "account", 365*24*time.Hour)
	if e != nil {
		t.Fatal(e)
	}
	// admin is always read|write|grant, write implies read.

	grantTest := []string{"read", "write", "read|grant", "write|grant"}
	for _, cap := range grantTest {
		// create a grant for the database
	}

	// verify checks that there is a valid path from the root to the target that includes the requested capability.
	ok := Verify(&pr, root.Pubkey, "host")
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
	sig := Sign(root.Privkey, challenge)
	_ = sig

	// if !Verify(root.Pubkey, challenge, sig) {
	// 	t.Fatal("failed to verify")
	// }

	// if !Authorize(tok, root.Pubkey, "admin") {
	// 	t.Fatal("failed to authorize")
	// }
}
