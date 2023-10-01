package dgrtc

import (
	"testing"
)

func Test_make(t *testing.T) {
	root, e := NewKeypair()
	if e != nil {
		t.Fatal(e)
	}
	tok := NewSite(root)

	admin, e := NewKeypair()
	if e != nil {
		t.Fatal(e)
	}
	adminTok, e := NewToken(root, admin, "admin", 0, 0)

	challenge := []byte("hello world")
	sig := Sign(admin.Privkey, challenge)
	if !Verify(admin.Pubkey, challenge, sig) {
		t.Fatal("failed to verify")
	}

	if !Authorize(tok, root.Pubkey, "admin") {
		t.Fatal("failed to authorize")
	}

}
