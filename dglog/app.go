package main

import (
	"datagrove/dgcap"
	"datagrove/dglib"
	"datagrove/dgstore"
	"fmt"
	"hash/fnv"
	"io"
	"log"
	"net/http"
	"path"
	"sync"

	"github.com/fxamacker/cbor/v2"
)

var serverSecret = []byte("serverSecret")

// what advantage is there to running the logger over https?
// we don't trust the logger anyway?
type ConfigHttps struct {
	Port string `json:"port,omitempty"`
	Http bool   `json:"http,omitempty"`
}
type Config struct {
	Account dgstore.Account `json:"account,omitempty"` // s3, local
	Https   []ConfigHttps   `json:"https,omitempty"`   // s3 bucket or local directory
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
	writer := func(n int) error {
		ch := app.Write[n]
		hc, e := NewHashChain(fmt.Sprintf("public/%d/", n), app.Client)
		if e != nil {
			return e
		}
		// flush writes the tail even if it is not full. It does not advance the tail pointer
		//ticker := time.NewTicker(3 * time.Second)
		//defer ticker.Stop()
		for r := range ch {
			// empty the channel
			rv := []Record{r}
			for len(ch) > 0 {
				rv = append(rv, <-ch)
			}
			hc.Append(rv)

			// case <-ticker.C:
			// 	hc.Flush()
		}
		return nil
	}

	// read configuration for the directory
	app.Config = Config{
		Account: dgstore.Account{
			Driver:          "",
			AccountId:       "",
			AccessKeyId:     "",
			AccessKeySecret: "",
			BucketName:      "",
			Endpoint:        "",
			UseHttp:         false,
		},
		Https: []ConfigHttps{{
			Port: ":3000",
			Http: true,
		}},
	}
	dglib.JsoncFile(&app.Config, path.Join(dir, "config.jsonc"))
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
	log.Printf("listening on %s", app.Config.Https[0].Port)
	return http.ListenAndServe(app.Config.Https[0].Port, nil)
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
	p, e := app.Client.Preauth(fmt.Sprintf("%x", dbid))
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

	app.Write[dbid%Writers] <- Record{
		Dbid: dbid,
		Data: n,
	}
}
