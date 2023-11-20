package dgcap

import (
	"sync"

	cuckoo "github.com/seiflotfy/cuckoofilter"
)

// the refresh token contains all keys used to validate the token when it was issue. If none of these have been revoked, then the token is valid.
// take a refresh token and return a new active token and a new refresh token

// we could rotate the secret by including a hash or a version number in the token. we would ensure that the secret expires after the token does.
type CapDb struct {
	root   []byte
	secret sync.Map
	filter *cuckoo.Filter
}

func NewCapDb() *CapDb {
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

// you can revoke capabilities that have never been granted because we never track what has been granted. The proof that you send is proof that you could have granted the capability.
func (a *CapDb) Revoke(pr *Proof, can string) error {
	// if proof
	return nil
}

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
