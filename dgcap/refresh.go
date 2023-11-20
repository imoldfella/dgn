package dgcap

import (
	"sync"

	cuckoo "github.com/seiflotfy/cuckoofilter"
)

// the refresh token contains all keys used to validate the token when it was issue. If none of these have been revoked, then the token is valid.
// take a refresh token and return a new active token and a new refresh token

func NewCapDb(dir string) *CapDb {
	return &CapDb{
		secret: sync.Map{},
		filter: cuckoo.NewFilter(1000 * 1000),
	}
}

// for refresh we can check the cuckoo filter; if the keys and edges are not in it then we know they are not revoked.
func (a *CapDb) Refresh(token []byte) ([]byte, []byte, error) {
	return nil, nil, nil
}

// we can remove keys from the filter when they expire since we know that all tokens that use them will have previously expired.

// revoke is a capability that can get passed around
// revoke(from,to,db,can) -> proof
// revoke-write implied by write?

func (a *CapDb) RevokeEdge(from, to []byte) error {
	ok := a.filter.Insert(append(from, to...))
	if !ok {
		// map is full, build
	}
	return nil
}
func (a *CapDb) RevokeNode(from []byte) error {
	return nil
}
