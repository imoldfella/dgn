package main

import (
	"datagrove/dgcl"
	"fmt"
	"log"
	"os"
	"strings"
)

// connecting to a bot might entail us becoming the bot if the bot is down.
// how do we indicate our willingness to become the bot?
// ConnectOrBecome("bot")

// dgc bot@datagrove.com "getClaims|analyze"
// dgc ssh bot@datagrove.com:port [dir]  # use dir to store ssh keys to offer consistency.

func main() {
	// the first non-flag argument is the target
	// the second non-flag argument is the commands to send, or if none then set up a terminal

	// port := flag.String("port","p","ip port")
	// flag.Parse()

	_ = os.Args
	if len(os.Args) < 2 {
		fmt.Println("usage: dgc target [command]")
		return
	}
	if os.Args[1] == "ssh" {
		if len(os.Args) < 3 {
			fmt.Println("usage: dgc ssh target [dir]")
			return
		}
		v := strings.Split(os.Args[2], "@")
		if len(v) != 2 {
			fmt.Println("usage: dgc ssh target [dir]")
			return
		}
		botname := v[0]

		return
	}

	if len(os.Args) >= 2 {
		// remote execution of commands, then exit.

		return
	}

	// start a terminal

	if len(v) != 2 {
		return log.Fatal("invalid target")
	}
	botname := v[0]
	host := v[1]
	// get a socketlike connection over webrtc.
	dgd, e := Connect(host)
	if e != nil {
		return e
	}

	cn, e := dgcl.Connect("x.localhost.direct:8082")
	if e != nil {
		log.Fatal("connect failed", e)
	}

}
