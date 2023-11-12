package main

import (
	"datagrove/dgcap"
	"encoding/hex"
	"io"
	"net/http"

	"datagrove/dglib"

	"github.com/fxamacker/cbor/v2"
)

type Dbid []byte

// return a signed url for uploading CAS blobs to a database.
// we can name blobs owner.sha to prevent collisions
// that also lets us audit for usage, reading the R2 logs.
func blob(res http.ResponseWriter, req *http.Request) {
	// we have to check that writer has access to the db, and that the name is prefixed by the db.
	auth := req.Header.Get("Authorization")
	dbid, e := dgcap.CanWrite([]byte(auth), serverSecret)
	if e != nil {
		return
	}
	p, e := app.Client.Preauth(hex.EncodeToString(dbid))
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

func commit(res http.ResponseWriter, req *http.Request) {
	dbid, err := dgcap.CanWrite([]byte(req.Header.Get("Authorization")), serverSecret)
	if err != nil {
		return
	}

	n, e := io.ReadAll(req.Body)
	if e != nil {
		return
	}
	// there is a character in the dbid that indicates if this is public or private.
	// all public databases go in the same stream, all private databases go in unique streams.

	app.Write <- Record{
		Dbid: dbid,
		Data: n,
	}
}
