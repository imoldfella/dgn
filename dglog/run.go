package main

import (
	"datagrove/dgstore"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"
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

type Record struct {
	Stream int64
	Data   []byte
}
type App struct {
	Dir string
	Config
	Client dgstore.Client
	Write  chan Record
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

func createAccount(res http.ResponseWriter, req *http.Request) {
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

	var login dglib.LoginOp
	var r dglib.LoginResponse
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

func verify(req *http.Request) (string, error) {
	x := req.Header.Get("Authorization")
	var token paseto.JSONToken
	var footer string
	err := paseto.Decrypt(x, serverSecret, &token, &footer)
	if err != nil {
		return "", err
	}

	return token.Subject, nil
}

type Tail struct {
	Data []byte
	Len  int
}

const (
	LogBlockSize = 32 * 1024
	LogFirst     = iota
	LogMiddle
	LogLast
	LogAll
)

func (t *Tail) Write(p []byte, flush func([]byte)) {
	remain := LogBlockSize - t.Len
	if len(p)+7 < remain {

	}
	t.Data = append(t.Data, p...)
	t.Len += len(p)
	if t.Len > LogBlockSize {
		flush(t.Data)
		t.Data = nil
		t.Len = 0
	}
}

// It's best to write a specific byte size since we might need to rewrite a page multiple times
// if the page had one really large transaction that could be expensive. we use the stra
func writer() {
	m := map[int64][][]byte{}
	for {
		r := <-app.Write
		m[r.Stream] = append(m[r.Stream], r.Data)
		if len(m[r.Stream]) > 100 {
			// upload the blobs
			// upload the transaction
			// commit the transaction
		}
	}
}

// authentication in a header lets us keep clear binary for the payload
func commit(res http.ResponseWriter, req *http.Request) {
	subj, e := verify(req)
	if e != nil {
		return
	}
	a := strings.Split(subj, " ")
	if len(a) != 2 || a[0] != "commit" {
		return
	}

	dbid, e := strconv.Atoi(a[1])
	n, e := io.ReadAll(req.Body)
	if e != nil {
		return
	}
	// there is a bit in the dbid that indicates if this is public or private.
	// all public databases go in the same stream, all private databases go in their own stream.
	public := dbid&1 == 0

	stream := 0
	if public {
		stream = dbid
	}

	//
	_ = dbid
	_ = n
}
