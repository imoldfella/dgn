package main

import (
	"datagrove/dgstore"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"time"

	"datagrove/dglib"

	"github.com/fxamacker/cbor/v2"
	"github.com/o1egl/paseto/v2"
)

var serverSecret = []byte("serverSecret")

type Config struct {
	Account dgstore.Account `json:"account,omitempty"` // s3, local
	Url     string          `json:"url,omitempty"`     // s3 bucket or local directory
}

type App struct {
	Dir string
	Config
	Client dgstore.Client
}

var app App

// client must send the correct authorization header for the database being written.
func CheckRequest(req *http.Request) (int64, error) {
	auth := req.Header.Get("Authorization")
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

// return a signed url for uploading a blob
// we can name blobs owner.sha to prevent collisions
// that also lets us audit for usage, reading the R2 logs.
func blob(res http.ResponseWriter, req *http.Request) {
	// we have to check that writer has access to the db, and that the name is prefixed by the db.
	dbid, e := CheckRequest(req)
	if e != nil {
		return
	}
	name := req.Form.Get("name")
	p, e := app.Client.Preauth(fmt.Sprintf("%d", dbid) + "/" + name)
	if e != nil {
		return
	}
	res.Write([]byte(p))
}

// transactions must be small, but can reference blobs
// POST forms are limited to 10mb anyway
// cbor

func startup(dir string) error {
	// read configuration for the directory
	dglib.JsoncFile(&app.Config, dir, "config.jsonc")
	cl, err := dgstore.NewClient(&app.Account)
	if err != nil {
		return err
	}
	app.Client = cl

	http.HandleFunc("/", func(res http.ResponseWriter, req *http.Request) {
		res.Write([]byte("dbhttp"))
	})
	http.HandleFunc("/commit", commit)
	http.HandleFunc("/blob", blob)
	http.HandleFunc("/login", login)
	return http.ListenAndServe(":3000", nil)
}

// login gets tokens that can be used to sign transactions with hmac
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
