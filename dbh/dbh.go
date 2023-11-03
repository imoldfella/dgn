package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path"

	"github.com/spf13/cobra"
)

type Config struct {
	Url string
	// Id is the public key of the root keypair
	Id string
	// this is the active keypair. The certificate is the public key signed by a chain of keypairs up to the root keypair
	Certificate string
	PrivateKey  string
	Bucket      string
	Firehose    string // directory to replicate firehose into.
}

type Firehose struct {
	Last int64
}

var config Config

func main() {
	loadConfig()
	var rootCmd = &cobra.Command{
		Use: "dghttp",
	}
	rootCmd.AddCommand(&cobra.Command{
		Use:   "configure",
		Short: "run [dir]",
		Args:  cobra.MinimumNArgs(1),
		Run: func(cmd *cobra.Command, args []string) {
			configure()
		},
	})

	rootCmd.AddCommand(&cobra.Command{
		Use:   "firehose",
		Short: "run [dir]",
		Args:  cobra.MinimumNArgs(1),
		Run: func(cmd *cobra.Command, args []string) {
			firehose()
		},
	})
	rootCmd.Execute()

}

func wget(url string) ([]byte, error) {
	return nil, nil
}

func firehose() error {
	// read the local firehose pointer
	b, e := os.ReadFile(path.Join(config.Firehose, "firehose.json"))
	if e != nil {
		return e
	}
	var fh Firehose
	json.Unmarshal(b, &fh)

	resp, err := http.Get(fmt.Sprintf("%s/%d", config.Bucket, fh.Last))
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	b, e = io.ReadAll(resp.Body)
	if e != nil {
		return e
	}
	// if the tail is longer than the one we have, then we need to read all the files referenced plus the files they reference.

}

func loadConfig() error {
	dir, e := os.UserHomeDir()
	if e != nil {
		log.Fatal(e)
	}
	config = Config{
		Url: "http://localhost:8080",
	}
	b, e := os.ReadFile(dir + "/.dbh/config.json")
	json.Unmarshal(b, &config)
}
func configure() {
	dir, e := os.UserHomeDir()
	if e != nil {
		log.Fatal(e)
	}

	loadConfig()
}
