package main

import (
	"datagrove/dgcap"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"

	"datagrove/dglib"

	"github.com/fxamacker/cbor/v2"
	"github.com/o1egl/paseto/v2"
)

type Dbid []byte

// return a signed url for uploading a blob
// we can name blobs owner.sha to prevent collisions
// that also lets us audit for usage, reading the R2 logs.
func blob(res http.ResponseWriter, req *http.Request) {
	// we have to check that writer has access to the db, and that the name is prefixed by the db.
	auth := req.Header.Get("Authorization")
	dbid, e := dgcap.CanWrite([]byte(auth), serverSecret)
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

// return a signed proof of an account. Accounts are the root certificate for all dbs. requires a valid email and/or phone number. Must choose a unique handle. We can use a giant filter to check for unique. We should direct these to a designated signup server.
type CreateAccount struct {
	Handle string
	Email  string
	Phone  string
}

func createAccount(res http.ResponseWriter, req *http.Request) {
}

// login gets tokens that can be used to sign transactions with hmac
// we need to send a proof that we can access all the dbs we want to access
// the return will return a token and a refresh token
// generally we want to do a database access here to check that the database is associated with an account of some kind (public or private). we could do this with a lag though or skip for public.
func login(res http.ResponseWriter, req *http.Request) {
	// return a signed url for uploading a blob
	// we can name blobs owner.sha to prevent collisions
	// that also lets us audit for usage, reading the R2 logs.
	var login dglib.LoginOp
	n, e := io.ReadAll(req.Body)
	if e != nil {
		return
	}
	cbor.Unmarshal(n, &login)

	var r dglib.LoginResponse
	for _, dbo := range login.Db {
		a, e := dgcap.ProofToken(&dbo, serverSecret, login.Time)
		if e == nil {
			r.Token = append(r.Token, a)
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
	// we need to look this up, cache in memory.
	StreamEnd int64
}

const (
	LogBlockSize = 64 * 1024
	LogAll       = 1
	LogFirst     = 2
	LogMiddle    = 3
	LogLast      = 4
)

func writeChecksum(d []byte, out []byte) {
	// we need to write a checksum
	// we need to write the length
	// we need to write the type
	// we need to write the data
}

func WriteObject(path string, data []byte) error {
	app.Client.Put(path, "application/octet-stream", data)
	return nil
}

// It's best to write a specific byte size since we might need to rewrite a page multiple times
// if the page had one really large transaction that could be expensive. we use the stra
// one issue is keeping multiple writes in-flight, and committing them to the client only when all previous writes are committed.

// authentication in a header lets us keep clear binary for the payload

func commit(res http.ResponseWriter, req *http.Request) {
	subj, e := verify(req) // returns the token subject in the form op args...
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
	// all public databases go in the same stream, all private databases go in unique streams.
	stream := 0
	if dbid&1 == 0 {
		stream = dbid
	}

	app.Write <- Record{
		Stream: int64(stream),
		Data:   n,
	}
}
