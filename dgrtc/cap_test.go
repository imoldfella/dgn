package dgrtc

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func Test_make(t *testing.T) {
	cap, e := NewSite()
	if e != nil {
		t.Fatal(e)
	}
	b := cap.Marshal()
	cap2, e := Unmarshal(b)
	assert.Equal(t, cap, cap2)
}
