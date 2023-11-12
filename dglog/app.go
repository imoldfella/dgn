package main

import (
	"datagrove/dgcap"
	"datagrove/dglib"
	"datagrove/dgstore"
	"net/http"
	"sync"
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
type App struct {
	Dir string
	Config
	Client dgstore.Client
	Write  chan Record

	pool sync.Pool
}

var app App

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
