package dgcap

import (
	"fmt"
	"strconv"
	"time"

	"github.com/o1egl/paseto/v2"
)

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

// check the proof and create a token
func ProofToken(proof *Proof, secret []byte, proofTime int64) ([]byte, error) {
	now := time.Now()
	exp := now.Add(24 * time.Hour)

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
	// jsonToken.Set("data", "this is a signed message")
	footer := ""

	// Encrypt data
	token, err := paseto.Encrypt(serverSecret, jsonToken, footer)
	if err != nil {
		r.Token = append(r.Token, "")
	} else {
		r.Token = append(r.Token, token)
	}
	return nil, nil
}

func CanRead(token []byte, secret []byte) ([]byte, error) {
	return nil, nil
}

func CanWrite(token []byte, secret []byte) ([]byte, error) {
	return nil, nil
}

func VerifyAuthHeader(auth string) (int64, error) {
	var token paseto.JSONToken
	var footer string
	err := paseto.Decrypt(auth, serverSecret, &token, &footer)
	if err != nil {
		return 0, err
	}
	dbid, e := strconv.Atoi(token.Subject)
	if e != nil {
		return 0, e
	}
	return int64(dbid), nil
}
