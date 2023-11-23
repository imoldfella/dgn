package dgcap

import "time"

// each signature has a commitment that is a sha256 hash of a random number.
// revealing that random number invalidates the signature.
// each token has a serial number.

// is this too much metadata to leave lying around?
type StoredGrant struct {
}

type CapStore interface {
	// recursively revokes all grants that depend on this grant.
	// once the token expires, we can remove it from the graph.
	AddRefreshToken(serial uint64, expires time.Time) error
	AddDependsOn(commitment []byte, serial uint64) error
	// checked when refreshing a token. If any comments that the token depends on are revoked, the token is revoked.
	IsRevokedSignature(data []byte) bool
	IsRevokedToken(serial uint64) bool
	StoreCommitment(commitment []byte, until time.Time) error
	Revoke(commitment []byte) error
}

type SimpleCapStore struct {
}

// Revoke implements CapStore.
func (*SimpleCapStore) Revoke(commitment []byte) error {
	panic("unimplemented")
}

// IsRevokedSignature implements CapStore.
func (*SimpleCapStore) IsRevokedSignature(data []byte) bool {
	panic("unimplemented")
}

// IsRevokedToken implements CapStore.
func (*SimpleCapStore) IsRevokedToken(serial uint64) bool {
	panic("unimplemented")
}

// StoreCommitment implements CapStore.
func (*SimpleCapStore) StoreCommitment(commitment []byte, until time.Time) error {
	panic("unimplemented")
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
