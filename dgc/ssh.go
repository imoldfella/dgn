package main

import (
	"datagrove/dgdb"
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

// maybe this is like drop box? we can upload and browse even offline, with a file system that mirrors connected databases?
// is webdav any better than sftp for anything?

// we can mount boturl if its not already mounted.
// func ProxySsh(boturl string, port string) {
// 	bot, e := ConnectBot(boturl)
// 	if e != nil {
// 		log.Fatal(e)
// 	}
// 	_ = bot
// }

// we are browsing a merged file system
func ProxySsh(o *dgdb.LocalServer, addr string) {

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
					// we need to sign the request, so that the bot can verify that the proxy is trusted as well as the client (another approach might be to configure as a bastion/jump server?) filezilla does not support jump servers though.
					// if this looks like
					//_, ok := running.Keys[string(key.Marshal())]
					// datachannel should be established already in the auth phase.

					// we can ask the lobby to connect us, the lobby has a channel with the bot already, it can ask the bot if it wants to talk to us. We will make a channel directly to the bot eventually.

					// we don't need to sign,
					// a problem with this is there's no way to return an error? maybe we should always allow and disconnect, but how would we error to an sftp client like filezilla?
					e := o.Allows(ctx.User(), key)
					return e != nil
				},
				SubsystemHandlers: map[string]ssh.SubsystemHandler{
					"sftp": func(sess ssh.Session) {
						// at this point create a new data channel directly to the bot.
						ch, e := webrtc.NewDataChannel(lobby, sess.User())
						if e != nil {
							return
						}
						defer ch.Close()
						sess.PublicKey()

						// note that this is only efficient if the ssh proxy is local and there is no turn server. potentially the local server could use various routing strategies?
						go func() {
							for {

							}
						}()
					},
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
