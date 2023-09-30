package dgrtc

import (
	"testing"
)

func Test_make(t *testing.T) {
	cap, admin, e := NewSite()
	if e != nil {
		t.Fatal(e)
	}

}
