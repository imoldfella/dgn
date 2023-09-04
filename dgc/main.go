package main

import (
	"bufio"
	"bytes"
	"datagrove/dgdb"
	"io"
	"log"
	"os"
	"strings"

	"github.com/joho/godotenv"
	"github.com/spf13/cobra"
	"golang.org/x/term"
)

// each service can offer a set of schemas.

// connecting to a bot might entail us becoming the bot if the bot is down.
// how do we indicate our willingness to become the bot?
// ConnectOrBecome("bot")

// works like ssh, fails if offline
// dgc bot@datagrove.com "getClaims|analyze"

// after running this, then you can sftp localhost:port to browse files  (or use filezilla, etc)
// this can work even if the bot is offline.

// dgc serve [dir]
// dgc link /bot  bot@datagrove.com:port  # use dir to store ssh keys to offer consistency.

type Environment struct {
	Args   []string
	Stdin  io.Reader
	Stdout io.Writer
}
type Options struct {
	StopOnError bool
}

func Terminal(cmd func(e Environment) error, opts Options) {
	// start a terminal

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
			if err != nil {
				if err == io.EOF {
					// do something different?
					return
				}
				return
			}
			if line == "" {
				continue
			}
			e := cmd(Environment{
				Args:   strings.Split(line, " "),
				Stdin:  stdin_reader,
				Stdout: writer,
			}) // bot.Output(line)
			if e != nil {
				if opts.StopOnError {
					log.Fatal(e)
				} else {
					log.Print(e)
				}
			}

		}
	}()
}

// on mac and linux we can use /etc/datagrove to store a pointer to the directory
// on windows we should use the registry?
func main() {
	godotenv.Load()
	// note that this isn't quite right? flags should be allowed before the
	// Args[1] does not contain @, so this is local command?
	var rootCmd = &cobra.Command{
		Use:   "dgx",
		Short: "dgx - clustered e2e datastore",
		Long: `dgx starts a cluster of 1, then you add more nodes.
		When restarting a cluster, you need enough nodes of the original cluster to recover the state. Any node of the cluster can be used as the start.`,
	}
	rootCmd.AddCommand(&cobra.Command{
		Use:   "exec",
		Short: "exec url [command]",
		Args:  cobra.MinimumNArgs(1),
		Run: func(cmd *cobra.Command, args []string) {
			// remote execution of commands, then exit.
			if len(os.Args) == 3 {
				dgdb.Remote(os.Args[0], os.Args[1])
			} else {
				// start a terminal
				bot, e := dgdb.ConnectBot(os.Args[0])
				if e != nil {
					log.Fatal(e)
				}
				Terminal(func(env Environment) error {
					s, e := bot.Output(strings.Join(env.Args, " "))
					env.Stdout.Write(s)
					return e
				}, Options{
					StopOnError: true,
				})
			}
		},
	})

	// the first non-flag argument is the target
	// the second non-flag argument is the commands to send, or if none then set up a terminal
	rootCmd.AddCommand(&cobra.Command{
		Use:   "start",
		Short: "start dir",
		Run: func(cmd *cobra.Command, args []string) {
			home := "."
			if len(args) > 0 {
				home = args[0]
			}
			dgdb.NewService(home)
		},
	})

	// the central server is like zeus directory servers, it regulates what cluster servers are live or dead.
	rootCmd.AddCommand(&cobra.Command{
		Use:   "central",
		Short: "central dir",
		Run: func(cmd *cobra.Command, args []string) {
			home := "."
			if len(args) > 0 {
				home = args[0]
			}
			dgdb.CentralServer(home)
		},
	})

	rootCmd.AddCommand(&cobra.Command{
		Use:   "core",
		Short: "core dir",
		Run: func(cmd *cobra.Command, args []string) {
			home := "."
			if len(args) > 0 {
				home = args[0]
			}
			dgdb.CoreServer(home)
		},
	})

	rootCmd.Execute()
}
