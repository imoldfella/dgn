package main

import (
	"bufio"
	"bytes"
	"fmt"
	"io"
	"log"
	"os"
	"strings"

	"github.com/spf13/cobra"
	"golang.org/x/term"
)

// connecting to a bot might entail us becoming the bot if the bot is down.
// how do we indicate our willingness to become the bot?
// ConnectOrBecome("bot")

// works like ssh, fails if offline
// dgc bot@datagrove.com "getClaims|analyze"

// after running this, then you can sftp localhost:port to browse files  (or use filezilla, etc)
// this can work even if the bot is offline.

// dgc serve [dir]
// dgc link /bot  bot@datagrove.com:port  # use dir to store ssh keys to offer consistency.

// on mac and linux we can use /etc/datagrove to store a pointer to the directory
// on windows we should use the registry?
func main() {

	// if the first argument has @ then this is a remote command
	// otherwise use normal command processing.
	if len(os.Args) == 3 && strings.Contains(os.Args[1], "@") {
		// remote execution of commands, then exit.
		remote(os.Args[1], os.Args[2])
		return
	}

	var rootCmd = &cobra.Command{
		Use:   "dgx",
		Short: "dgx - clustered e2e datastore",
		Long: `dgx starts a cluster of 1, then you add more nodes.
		When restarting a cluster, you need enough nodes of the original cluster to recover the state. Any node of the cluster can be used as the start.`,
	}
	// the first non-flag argument is the target
	// the second non-flag argument is the commands to send, or if none then set up a terminal
	var start = &cobra.Command{
		Use:   "start",
		Short: "start cluster",
		Args:  cobra.ExactArgs(1),
		Run: func(cmd *cobra.Command, args []string) {
		},
	}
	rootCmd.AddCommand(start)
	rootCmd.Execute()

	if os.Args[1] == "sftp" {
		if len(os.Args) < 3 {
			fmt.Println("usage: dgc ssh target [dir]")
			return
		}
		v := strings.Split(os.Args[2], ":")
		bot := v[0]
		port := "2022"
		if len(v) > 1 {
			port = v[1]
		}
		ProxySsh(bot, port)
		return
	}

	if len(os.Args) >= 2 {

		return
	}

	// start a terminal
	bot, e := ConnectBot(os.Args[1])
	if e != nil {
		log.Fatal(e)
	}
	stdin_reader, _ := io.Pipe()
	reader := bufio.NewReader(stdin_reader)

	stdout_writer := bytes.Buffer{}
	writer := bufio.NewWriter(&stdout_writer)

	rw := bufio.NewReadWriter(reader, writer)
	t := term.NewTerminal(rw, "> ")

	// constantly be reading lines
	go func() {
		for {
			line, err := t.ReadLine()
			if err == io.EOF {
				log.Printf("got EOF")
			}
			if err != nil {
				log.Printf("got err")
			}
			if line == "" {
				continue
			}
			s, e := bot.Output(line)
			if e != nil {
				log.Fatal(e)
			}
			fmt.Printf(string(s))
		}
	}()
}
