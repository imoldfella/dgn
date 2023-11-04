package main

import (
	"fmt"
	"io"
	"net/http"
	"strconv"
	"time"

	"github.com/fxamacker/cbor/v2"
	"github.com/o1egl/paseto/v2"
)

var serverSecret = []byte("serverSecret")

type Config struct {
	Backend string // s3, local
	Url     string // s3 bucket or local directory
}

type Backend interface {
	Put(key string, value []byte) error
	Get(key string) ([]byte, error)
}

// return a signed url for uploading a blob
// we can name blobs owner.sha to prevent collisions
// that also lets us audit for usage, reading the R2 logs.
func blob(res http.ResponseWriter, req *http.Request) {
	cl, e := NewS3Client()
	if e != nil {
		panic(e)
	}

}

// transactions must be small, but can reference blobs
// POST forms are limited to 10mb anyway
// cbor

type Proof struct {
}

type DbLogin struct {
	Db    int64
	Proof []Proof
}

type Login struct {
	Db []DbLogin
}
type LoginResponse struct {
	Token []string
}

// this allows a write to a db
type TokenPayload struct {
	Db int64
}

func startup() {
	// read configuration for the directory

}

// login gets a secret that can be used to sign transactions with hmac
// we need to send a proof that we can access all the dbs we want to access
// the return will return a token and a refresh token
func login(res http.ResponseWriter, req *http.Request) {
	// return a signed url for uploading a blob
	// we can name blobs owner.sha to prevent collisions
	// that also lets us audit for usage, reading the R2 logs.
	n, e := io.ReadAll(req.Body)
	if e != nil {
		return
	}

	var login Login
	var r LoginResponse
	cbor.Unmarshal(n, &login)

	now := time.Now()
	exp := now.Add(24 * time.Hour)

	for _, dbo := range login.Db {

		_ = dbo.Proof
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
		jsonToken.Set("data", "this is a signed message")
		footer := "some footer"

		// Encrypt data
		token, err := paseto.Encrypt(serverSecret, jsonToken, footer)
		if err != nil {
			r.Token = append(r.Token, "")
		} else {
			r.Token = append(r.Token, token)
		}
	}
	b, e := cbor.Marshal(&r)
	if e != nil {
		return
	}
	res.Write(b)
}

// I think the point of refresh is to disconnect revocation from the access check
// it forces the client to go through a revocation check periodically.

// func refresh(res http.ResponseWriter, req *http.Request) {
// 	// return a signed url for uploading a blob
// 	// we can name blobs owner.sha to prevent collisions
// 	// that also lets us audit for usage, reading the R2 logs.

// 	// this is a public key

// }

// authentication in a header lets us keep clear binary for the payload
func commit(res http.ResponseWriter, req *http.Request) {
	x := req.Header.Get("Authorization")
	var token paseto.JSONToken
	var footer string
	err := paseto.Decrypt(x, serverSecret, &token, &footer)
	if err != nil {
		return
	}
	dbid, e := strconv.Atoi(token.Subject)
	if e != nil {
		return
	}
	n, e := io.ReadAll(req.Body)
	if e != nil {
		return
	}

	//
	_ = dbid
	_ = n
}
