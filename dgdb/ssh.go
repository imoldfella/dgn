package dgdb

import (
	"fmt"
	"io"
	"log"
	"os"
	"os/signal"
	"path"

	"github.com/gliderlabs/ssh"
	"github.com/mitchellh/go-homedir"
	"github.com/pkg/sftp"
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
func ProxySftp(o *LocalServer, addr string) {
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

	// how can we get the server that they are connecting to (wild card dns)
	ssh_server := ssh.Server{
		Addr: addr,
		PublicKeyHandler: func(ctx ssh.Context, key ssh.PublicKey) bool {
			// should we require the local key here? should we manage a directory/table of keys
			return true
		},
		SubsystemHandlers: map[string]ssh.SubsystemHandler{
			"sftp": func(sess ssh.Session) {
				debugStream := io.Discard
				serverOptions := []sftp.ServerOption{
					sftp.WithDebug(debugStream),
				}

				// this server is for the current directory, no ups.
				// if we use this then we need to sync the database to the file system. this has other benefits, but is a performance hit.
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
			},
		},
	}

	kf := ssh.HostKeyFile(keyfile)
	kf(&ssh_server)
	go log.Fatal(ssh_server.ListenAndServe())

	interrupt := make(chan os.Signal, 1)
	signal.Notify(interrupt, os.Interrupt)
	<-interrupt
	log.Println("exit")
}

// SftpHandler handler for SFTP subsystem
// we need to change the directory to the data directory.

/* not used, we don't proxy ssh, only sftp
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
*/
