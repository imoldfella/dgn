package dgcap

// admin/write/read

// type Capability struct {
// 	Pubkey  []byte
// 	Privkey []byte

// 	Channel     []byte // the public key of the channel
// 	IssueTo     []byte // public key of capability
// 	Auth        string
// 	ProofLength int    // if 0, then Proof is a signature, otherwise it is a capability.
// 	Proof       []byte //chain of signatures (and capabilities?)
// }

// an authorization is a signed attenuation.
// the root is always an admin. each signature in the chain must be a valid (not revoked) id.

// the first "to" is the site id.
// the second "to" is the initial admin key

// the main operation is validate(challenge, proof)
// challenge is derived from the session id.
// challenge will be the final "Publickey" in the chain.
// session will be given the capabilities in the final capability string.
// the server can store these validated capabilities. a database keyed by the session id.
// a proof is a chain of grants

type Keychain interface {
}

type Validator struct {
	// we can check signatures in the cache as speedup?
	Cache   map[string]*signedPacket
	Session map[int64]map[string]bool
}

func (v *Validator) Validate(session int64, proof []byte) error {
	return nil
}
func (v *Validator) Allow(session int64, db, cap string) bool {
	return true
}

// maybe give a keychain.
func NewValidator() *Validator {
	return &Validator{
		Cache: make(map[string]*signedPacket),
	}
}

// this could have multiple chains starting over at the root if multiple capabilities have been received from different authorizors.
// empty capability indicates root key.
type AccessProof struct {
	Version    string
	Publickey  [][]byte
	Signature  [][]byte
	Capability [][]string
	Begin      []int64
	End        []int64
}

// owner proofs
func NewOwnerProof(kp Keypair, challenge []byte) (*AccessProof, error) {
	return &AccessProof{
		Version: "1",
	}, nil
}
func (kp Keypair) Grant(a AccessProof, cap []string, begin, end int64) (*AccessProof, error) {
	return nil, nil
}
func MergeProofs(a, b AccessProof) AccessProof {
	return AccessProof{}
}

type signedPacket struct {
	To         []byte
	Capability map[string]bool
	Begin      uint64
	End        uint64
}

/*

func (kp *Keypair) Sign(challenge []byte) []byte {
	return ed25519.Sign(kp.Privkey, challenge)
}
func (kp *AccessProof) Subject() []byte {
	return kp.Publickey[0]
}
type Grantor struct {
	AccessProof
	Privkey []byte // matches final public key of chain
}

// default to one year; that allows us to clean out tokens annually and only hold revokes for one year. The root key does not expire.
func (kp *Grantor) Grant(toPublicKey []byte, claims map[string]bool) (AccessToken, error) {
	jsonToken := paseto.JSONToken{
		Subject:    hex.EncodeToString(toPublicKey),
		NotBefore:  time.Now(),
		Expiration: time.Now().Add(365 * 24 * time.Hour),
	}
	token, err := paseto.Sign(kp.Privkey, jsonToken, nil)
	if err != nil {
		return nil, err
	}

	r := append(kp.AccessToken, GrantData{toPublicKey, token})
	return r, nil
}

func (kp *Keypair) GrantTemporary(cap string, exp uint64) (*AccessToken, error) {
	return nil, nil
}

// authorization is a sorted set of strings x|y|z|...

func Verify1(public []byte, challenge []byte, sig []byte) bool {
	return ed25519.Verify(public, challenge, sig)
}

func SignedBlock(d *GrantData) []byte {
	b := d.To
	b = binary.AppendUvarint(b, d.Begin)
	b = binary.AppendUvarint(b, d.End)
	b = append(b, d.Auth...)

	return b
}

// 1. auth must be in the final authorization
// 2. Each signature must be valid
func Verify(tok *AccessToken, pubkey []byte, auth string) bool {

	for i, sig := range tok.Chain {
		blk := tok.SignedBlock(i)
		if !Verify(pubkey, blk, sig) {
			return false
		}

	}

}

// should we allow the admin key to expire?
func NewSite(site Keypair) *AccessToken {
	return &AccessToken{
		Root: site.Pubkey,
	}
}

func (base *AccessToken) Grant(d *GrantData) (*AccessToken, error) {
	r := *base
	r.To = append(r.To, d.To)
	r.Begin = append(r.Begin, d.Begin)
	r.End = append(r.End, d.End)
	r.Auth = append(r.Auth, d.Auth)

	sig := ed25519.Sign(d.Signer.Privkey, b)
	r.Signature = append(r.Signature, sig)

	return &r, nil
}

// returns an admin capability and new root keypair.
func NewKeypair() (Keypair, error) {
	pub, priv, e := ed25519.GenerateKey(rand.Reader)
	if e != nil {
		return Keypair{}, e
	}
	r := Keypair{
		Pubkey:  pub,
		Privkey: priv,
	}
	return r, nil
}

func (c *AccessToken) Marshal() []byte {
	return nil
}

func Unmarshal(data []byte) (*AccessToken, error) {
	return nil, nil
}
*/
