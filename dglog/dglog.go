package main

import (
	"datagrove/dbhttplib"
	"io"
	"log"
	"net/http"

	"github.com/kardianos/service"
	"github.com/spf13/cobra"
)

var db *dbhttplib.Dbhttp
var directory = "./data"
var logger service.Logger

type program struct{}

func (p *program) Start(s service.Service) error {
	// Start should not block. Do the actual work async.
	go p.run()
	return nil
}
func (p *program) run() {

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

}
func (p *program) Stop(s service.Service) error {
	// Stop should not block. Return with a few seconds.
	return nil
}

type Config struct {
	Backend string // s3, local
	Url     string // s3 bucket or local directory
}

type Backend interface {
	Put(key string, value []byte) error
	Get(key string) ([]byte, error)
}

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
			svcConfig := &service.Config{
				Name:        "GoServiceTest",
				DisplayName: "Go Service Test",
				Description: "This is a test Go service.",
			}

			prg := &program{}
			s, err := service.New(prg, svcConfig)
			if err != nil {
				log.Fatal(err)
			}
			logger, err = s.Logger(nil)
			if err != nil {
				log.Fatal(err)
			}
			err = s.Run()
			if err != nil {
				logger.Error(err)
			}

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
// cbor
type Tx struct {
	Db    int64
	Coded []byte
}

func commit(res http.ResponseWriter, req *http.Request) {

	n, e := io.ReadAll(req.Body)
	if e != nil {
		return
	}
	db.Commit()
}
