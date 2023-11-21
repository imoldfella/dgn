package dgcap

import "time"

// each signature has a commitment that is a sha256 hash of a random number.
// revealing that random number invalidates the signature.
// each token has a serial number.
type CapStore interface {
	// recursively revokes all grants that depend on this grant.
	// once the token expires, we can remove it from the graph.
	AddRefreshToken(serial uint64, expires time.Time) error
	AddDependsOn(commitment []byte, serial uint64) error
	// checked when refreshing a token. If any comments that the token depends on are revoked, the token is revoked.
	IsRevoked(serial uint64) bool
}

type SimpleCapStore struct {
}

// AddDependsOn implements CapStore.
func (*SimpleCapStore) AddDependsOn(commitment []byte, serial uint64) error {
	panic("unimplemented")
}

// AddRefreshToken implements CapStore.
func (*SimpleCapStore) AddRefreshToken(serial uint64, expires time.Time) error {
	panic("unimplemented")
}

// IsRevoked implements CapStore.
func (*SimpleCapStore) IsRevoked(serial uint64) bool {
	panic("unimplemented")
}

var _ CapStore = &SimpleCapStore{}
