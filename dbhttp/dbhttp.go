package main

import (
	"datagrove/dbhttplib"
	"io"
	"log"
	"net/http"
)

var db *dbhttplib.Dbhttp

func main() {

	http.HandleFunc("/", func(res http.ResponseWriter, req *http.Request) {
		res.Write([]byte("dbhttp"))
	})
	directory := "./data"
	http.Handle("/db", http.FileServer(http.Dir(directory)))
	http.HandleFunc("/", func(res http.ResponseWriter, req *http.Request) {
		res.Write([]byte("dbhttp"))
	})
	http.HandleFunc("/commit", commit)

	// blobs are streamed and can be very large
	http.HandleFunc("/blob", func(res http.ResponseWriter, req *http.Request) {

	})

	log.Fatal(http.ListenAndServe(":3000", nil))

}

// transactions must be small, but can reference blobs
// POST forms are limited to 10mb anyway
func commit(res http.ResponseWriter, req *http.Request) {
	n, e := io.ReadAll(req.Body)
	if e != nil {
		return
	}
	db.Commit()
}
