package main

import (
	"datagrove/dgcap"
	"datagrove/dglib"
	"datagrove/dgstore"
	"encoding/hex"
	"fmt"
	"hash/fnv"
	"io"
	"net/http"
	"sync"
	"time"

	"github.com/fxamacker/cbor/v2"
)

var serverSecret = []byte("serverSecret")

type Config struct {
	Account dgstore.Account `json:"account,omitempty"` // s3, local
	Url     string          `json:"url,omitempty"`     // s3 bucket or local directory
}

type Record struct {
	dgcap.Dbid
	Data []byte
}

const (
	Writers = 100
)

type App struct {
	Dir string
	Config
	Client dgstore.Client
	Write  []chan Record

	pool sync.Pool
}

var app App

func startup(dir string) error {

	writer := func(n int) {
		ch := app.Write[n]
		hc := NewHashChain(fmt.Sprintf("public/%d/", n), app.Client)
		// flush writes the tail even if it is not full. It does not advance the tail pointer
		ticker := time.NewTicker(3 * time.Second)
		defer ticker.Stop()
		for {
			select {
			case r := <-ch:
				hc.Append(r.Dbid, r.Data)
			case <-ticker.C:
				hc.Flush()
			}
		}
	}

	// read configuration for the directory
	dglib.JsoncFile(&app.Config, dir, "config.jsonc")
	cl, err := dgstore.NewClient(&app.Account)
	if err != nil {
		return err
	}
	app.Client = cl
	app.pool.New = func() interface{} {
		return new(HashChain)
	}
	app.Write = make([]chan Record, Writers)
	for i := 0; i < Writers; i++ {
		app.Write[i] = make(chan Record, 1000)
		go writer(i)
	}

	http.HandleFunc("/", func(res http.ResponseWriter, req *http.Request) {
		res.Write([]byte("dbhttp"))
	})
	http.HandleFunc("/commit", commit)
	http.HandleFunc("/blob", blob)
	http.HandleFunc("/login", login)
	return http.ListenAndServe(":3000", nil)
}

// hash a binary array, use hash to pick deterministically from a set of n

func hashPick(n int, b []byte) int {
	h := fnv.New32a()
	h.Write(b)
	return int(h.Sum32()) % n
}

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

	app.Write[hashPick(Writers, dbid)] <- Record{
		Dbid: dbid,
		Data: n,
	}
}
