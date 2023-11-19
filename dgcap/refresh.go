package dgcap

import "sync"

// the refresh token contains all keys used to validate the token when it was issue. If none of these have been revoked, then the token is valid.
// take a refresh token and return a new active token and a new refresh token

// we could rotate the secret by including a hash or a version number in the token. we would ensure that the secret expires after the token does.
type CapDb struct {
	secret sync.Map
}

func (a *CapDb) Refresh(token []byte) ([]byte, []byte, error) {
	return nil, nil, nil
}

// we can remove keys from the filter when they expire since we know that all tokens that use them will have previously expired.

// revoke is a capability that can get passed around
// revoke(from,to,db,can) -> proof

// the rev
func (a *CapDb) Revoke(pr *Proof) error {
	// if proof
	return nil
}
