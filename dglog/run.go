package main

import (
	"datagrove/dgstore"
	"encoding/binary"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"
	"sync"
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

	pool sync.Pool
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
	app.pool.New = func() interface{} {
		return new(Tail)
	}

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
// generally we want to do a database access here to check that the database is associated with an account of some kind (public or private).
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
func writer() {
	m := map[int64]Tail{}

	flush := func(t Tail) {
		// we can write this async, but we only want to commit to the writer when all previous writes are committed.
	}

	write := func(r Record) {
		t, ok := m[r.Stream]
		p := r.Data
		if !ok {
			t = app.pool.Get().(Tail)
			m[r.Stream] = t
		}
		for {
			remain := LogBlockSize - t.Len
			if remain < 8 {

				t.Len = 0
				continue
			}
			if len(p)+7 < remain {
				writeChecksum(p, t.Data[t.Len:])
				binary.LittleEndian.PutUint16(t.Data[t.Len+4:], uint16(len(p)))
				t.Data[t.Len+6] = LogAll
				copy(t.Data[t.Len+7:], p)
				t.Len += len(p) + 7
				return
			} else if remain < 7 {

			}
			t.Data = append(t.Data, p...)
			t.Len += len(p)
			if t.Len > LogBlockSize {
				flush(t.Data)
				t.Data = nil
				t.Len = 0
			}
		}

	}
	ticker := time.NewTicker(10 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case r := <-app.Write:
			write(r)
		case <-ticker.C:
			// flush all the tails
			for _, t := range m {
				flush(t)
			}
			m = map[int64]Tail{}
		}

	}
}

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
