package dgcap

import (
	"time"

	"github.com/o1egl/paseto/v2"
)

type Dbid []byte
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

// client must send the correct authorization header for the database being written.
func CheckRequest(auth string, secret []byte) ([]byte, error) {

	var token paseto.JSONToken
	var footer string
	err := paseto.Decrypt(auth, secret, &token, &footer)
	if err != nil {
		return nil, err
	}
	return []byte(token.Subject), nil
}

// check the proof and create a token. The token avoids having to check the proof again.
func ProofToken(proof *Proof, secret []byte, proofTime int64) ([]byte, error) {
	now := time.Now()
	exp := now.Add(24 * time.Hour)

	// todo: check that the proof is valid
	// todo: check that the database is valid

	jsonToken := paseto.JSONToken{
		Audience:   "test",
		Issuer:     "test_service",
		Jti:        "123",
		Subject:    "", // dbo.Db,
		IssuedAt:   now,
		Expiration: exp,
		NotBefore:  now,
	}
	// Add custom claim    to the token
	// jsonToken.Set("data", "this is a signed message")
	footer := ""

	// Encrypt data
	token, err := paseto.Encrypt(secret, jsonToken, footer)
	return []byte(token), err
}

func CanRead(token []byte, secret []byte) (Dbid, error) {
	return nil, nil
}

func CanWrite(token []byte, secret []byte) (Dbid, error) {
	return nil, nil
}

// returns the account that the database can be created in
func CanCreate(token []byte, secret []byte) (Dbid, error) {
	return nil, nil
}

// take a refresh token and return a new active token and a new refresh token
func Refresh(token []byte, secret []byte) ([]byte, []byte, error) {
	return nil, nil, nil
}

// func VerifyAuthHeader(auth string,) (int64, error) {
// 	var token paseto.JSONToken
// 	var footer string
// 	err := paseto.Decrypt(auth, secret, &token, &footer)
// 	if err != nil {
// 		return 0, err
// 	}
// 	dbid, e := strconv.Atoi(token.Subject)
// 	if e != nil {
// 		return 0, e
// 	}
// 	return int64(dbid), nil
// }