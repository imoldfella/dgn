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

var config Config

type Firehose struct {
	Last int64
}

func readLast() int64 {
	// read the local firehose pointer
	b, e := os.ReadFile(path.Join(config.Firehose, "firehose.json"))
	if e != nil {
		return 0
	}
	var fh Firehose
	json.Unmarshal(b, &fh)
	return fh.Last
}
func writeLast(ln int64) error {
	fh := Firehose{
		Last: ln,
	}
	b, e := json.Marshal(fh)
	if e != nil {
		return e
	}
	return os.WriteFile(path.Join(config.Firehose, "firehose.json"), b, 0644)
}

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

// when checking the tail we should provide an etag to avoid downloading an unchanged metablock. As long as we only check every second or so we should always see a change anyway.
func firehose() error {
	wget := func(url string) ([]byte, error) {
		resp, err := http.Get(url)
		if err != nil {
			return nil, err
		}
		defer resp.Body.Close()
		return io.ReadAll(resp.Body)
	}

	// read the last page in the sequence. Increment this when the page fills up.
	ln := readLast()
	b, e := wget(fmt.Sprintf("%s/%d", config.Bucket, ln))
	if e != nil {
		return e
	}
	full := len(b) == 16*1024

	if full {
		writeLast(ln + 1)
	}

	// if the tail is longer than the one we have, then we need to read all the files referenced plus the files they reference.
	return nil
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
	return nil
}
func configure() {
	dir, e := os.UserHomeDir()
	if e != nil {
		log.Fatal(e)
	}

	loadConfig()
	_ = dir
}
