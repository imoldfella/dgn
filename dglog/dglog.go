package main

import (
	"datagrove/dbhttplib"
	"io"
	"log"
	"net/http"

	"github.com/spf13/cobra"
)

var db *dbhttplib.Dbhttp
var directory = "./data"

type Config struct {
	Backend string  // s3, local
	Url     string  // s3 bucket or local directory
}

type Backend interface {
	Put(key string, value []byte) error
	Get(key string) ([]byte, error)
}
type Program

func main() {
	var rootCmd = &cobra.Command{
		Use: "dghttp",
	}
	rootCmd.AddCommand(&cobra.Command{
		Use:   "run",
		Short: "run [dir]",
		Args:  cobra.MinimumNArgs(1),
		Run: func(cmd *cobra.Command, args []string) {

			if len(args) > 0 {
				directory = args[0]
			}

			http.HandleFunc("/", func(res http.ResponseWriter, req *http.Request) {
				res.Write([]byte("dbhttp"))
			})

			http.Handle("/db", http.FileServer(http.Dir(directory)))

			http.HandleFunc("/", func(res http.ResponseWriter, req *http.Request) {
				res.Write([]byte("dbhttp"))
			})
			http.HandleFunc("/commit", commit)
			http.HandleFunc("/blob", blob)

			log.Fatal(http.ListenAndServe(":3000", nil))
		},
	})

}

// return a signed url for uploading a blob
// we can name blobs owner.sha to prevent collisions
// that also lets us audit for usage, reading the R2 logs.
func blob(res http.ResponseWriter, req *http.Request) {
	//
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
