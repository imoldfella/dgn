package dgcap

import (
	"testing"
)

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
