package main

import (
	"encoding/json"
	"log"
	"os"

	"github.com/spf13/cobra"
)

type Config struct {
	Url string
	// Id is the public key of the root keypair
	Id string
	// this is the active keypair. The certificate is the public key signed by a chain of keypairs up to the root keypair
	Certificate string
	PrivateKey  string
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

func firehose() {
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
