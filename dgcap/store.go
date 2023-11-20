package dgcap

import "time"

type SimpleCapStore struct {
}

// AddDependsOn implements CapStore.
func (*SimpleCapStore) AddDependsOn(uint64, uint64) error {
	return nil
}

// AddRevoke implements CapStore.
func (*SimpleCapStore) AddRevoke(serial uint64, expires time.Time) error {
	return nil
}

// Expire implements CapStore.
func (*SimpleCapStore) Expire() error {
	return nil
}

// IsRevoked implements CapStore.
func (*SimpleCapStore) IsRevoked(uint64) bool {
	return false
}

var _ CapStore = &SimpleCapStore{}
