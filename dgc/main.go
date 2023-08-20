package main

import (
	"datagrove/dgdb"
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/spf13/cobra"
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
		Short: "start dir",
		Run: func(cmd *cobra.Command, args []string) {
			home := "."
			if len(args) > 0 {
				home = args[0]
			}
			Start(home)
		},
	}
	rootCmd.AddCommand(start)
	rootCmd.Execute()
}

func Start(home string) {
	if len(os.Args) < 3 {
		fmt.Println("usage: dgc ssh target [dir]")
		return
	}
	db, e := dgdb.NewLocalServer(home)
	if e != nil {
		log.Fatal(e)
	}
	ProxySftp(db)
	return
}
