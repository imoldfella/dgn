package dgcap

import (
	"sync"
	"time"

	cuckoo "github.com/seiflotfy/cuckoofilter"
)

//	we only track the tokens we have issued, and not expired
//
// we also have the option of re-proving the refresh token if we blow up the cuckoo map.
type Pdict interface {
}

type RevokeDb interface {
	Add(key []byte, until time.Time) error
	Includes(key []byte) bool
}

type SimpleRevokeDb struct {
	secret sync.Map
	filter *cuckoo.Filter
}

func NewRevokeDb() *CapDb {
	return &CapDb{
		secret: sync.Map{},
		filter: cuckoo.NewFilter(1000 * 1000),
	}
}
