package main

import (
	"fmt"
	"io"
	"log"
	"os"
	"os/signal"
	"path"
	"strings"

	"github.com/gliderlabs/ssh"
	"github.com/mitchellh/go-homedir"
	"github.com/pkg/sftp"
	"golang.org/x/term"
)

// authorization here is pass through, so we need very little configuration.
func main() {
	// cobra cli?
	// connect to dgd for signaling.
	addr := ":2022"
	var keyfile string
	if keyfile == "" {
		// the exact key doesn't matter here, only that we don't keep changing it.
		// id_rsa of the account running the service is convenient
		// user's home directory as the default.
		dir, e := homedir.Dir()
		if e != nil {
			log.Fatal(e)
		}
		keyfile = path.Join(dir, ".ssh/id_rsa")
	}

	go func() {
		command := func(t *term.Terminal, line string) {
		}
		ssh.Handle(func(s ssh.Session) {
			t := term.NewTerminal(s, "> ")

			// we can pass the user and server along to the bot.
			s.User()
			if len(s.Command()) > 0 {
				o := strings.Join(s.Command(), " ")
				command(t, o)
				return
			}

			for {
				line, err := t.ReadLine()
				if err != nil {
					break
				}
				command(t, line)
			}
			log.Println("terminal closed")
		})
		if true {
			// how can we get the server that they are connecting to (wild card dns)
			ssh_server := ssh.Server{
				Addr: addr,
				PublicKeyHandler: func(ctx ssh.Context, key ssh.PublicKey) bool {
					// this needs to connect to the bot so the bot can decide. should we cache a connection to the bot for this sort of thing?
					//_, ok := running.Keys[string(key.Marshal())]
					return true
				},
				SubsystemHandlers: map[string]ssh.SubsystemHandler{
					"sftp": SftpHandlerx,
				},
			}

			kf := ssh.HostKeyFile(keyfile)
			kf(&ssh_server)
			log.Fatal(ssh_server.ListenAndServe())
		}

	}()

	interrupt := make(chan os.Signal, 1)
	signal.Notify(interrupt, os.Interrupt)
	<-interrupt
	log.Println("exit")
}

// SftpHandler handler for SFTP subsystem
// we need to change the directory to the data directory.
func SftpHandlerx(sess ssh.Session) {
	// we only have user to identify the target bot
	sess.User()

	//os.Chdir(config.Data)
	debugStream := io.Discard
	serverOptions := []sftp.ServerOption{
		sftp.WithDebug(debugStream),
	}
	server, err := sftp.NewServer(
		sess,
		serverOptions...,
	)
	if err != nil {
		log.Printf("sftp server init error: %s\n", err)
		return
	}

	if err := server.Serve(); err == io.EOF {
		server.Close()
		fmt.Println("sftp client exited session.")
	} else if err != nil {
		fmt.Println("sftp server completed with error:", err)
	}
}
