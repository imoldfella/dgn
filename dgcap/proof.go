package dgcap

type Proof struct {
	Db        []byte
	Signature []Signature
}

type Signature struct {
	Data      []byte
	Can       []string
	NotBefore int64
	NotAfter  int64
}

// check the proof and create a token
func ProofToken(secret []byte) ([]byte, error) {
	return nil, nil
}

func CanRead(token []byte, secret []byte) ([]byte, error) {
	return nil, nil
}

func CanWrite(token []byte, secret []byte) ([]byte, error) {
	return nil, nil
}

_ = dbo.Proof
// todo: check that the proof is valid
// todo: check that the database is valid

jsonToken := paseto.JSONToken{
	Audience:   "test",
	Issuer:     "test_service",
	Jti:        "123",
	Subject:    fmt.Sprintf("%d", dbo.Db),
	IssuedAt:   now,
	Expiration: exp,
	NotBefore:  now,
}
// Add custom claim    to the token
//jsonToken.Set("data", "this is a signed message")
footer := ""

// Encrypt data
token, err := paseto.Encrypt(serverSecret, jsonToken, footer)
if err != nil {
	r.Token = append(r.Token, "")
} else {
	r.Token = append(r.Token, token)
}