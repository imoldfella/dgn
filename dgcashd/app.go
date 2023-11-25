package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"path"
	"strconv"

	"github.com/tailscale/hujson"
)

type Config struct {
	Https []struct {
		Port string `json:"port,omitempty"`
	}
}
type App struct {
	Dir string
	Config
}

var app App

func startup(dir string) error {
	app.Dir = dir

	b, e := os.ReadFile(path.Join(app.Dir, "index.jsonc"))
	if e != nil {
		return e
	}
	b, e = hujson.Standardize(b)
	if e != nil {
		return e
	}
	e = json.Unmarshal(b, &app.Config)
	if e != nil {
		return e
	}

	http.HandleFunc("/", func(res http.ResponseWriter, req *http.Request) {
		res.Write([]byte("dgcashd 0.1"))
	})

	// no sales tax anywhere?
	http.HandleFunc("/cart", func(res http.ResponseWriter, req *http.Request) {
		amt := req.URL.Query()["amount"]
		if len(amt) == 0 {
			return
		}
		o, e := strconv.Atoi(amt[0])
		if e != nil {
			return
		}

	})

	// this will be a request from datagrove to spend a coin and apply it to a database.
	http.HandleFunc("/spend", func(res http.ResponseWriter, req *http.Request) {

	})

	log.Printf("listening on %s", app.Config.Https[0].Port)
	return http.ListenAndServe(app.Config.Https[0].Port, nil)

}
