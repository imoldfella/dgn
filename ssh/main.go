package main

import (
	"fmt"
	"io"
	"log"
	"os"
	"os/signal"
	"path"
	"sync/atomic"
	"time"

	"github.com/gliderlabs/ssh"
	"github.com/go-co-op/gocron"
	homedir "github.com/mitchellh/go-homedir"
	"github.com/pkg/sftp"
	"golang.org/x/term"
)

func main() {
	SshStart()
}

var version int64

func RunChrone() {
	s := gocron.NewScheduler(time.UTC)
	for {
		v := atomic.LoadInt64(&version)
		for version == v {

		}
	}
}

// load is a command that replaces the current schedule with a new one.
// it fails, leaving the current schedule in place, if the new schedule is invalid.
func LoadChron() {

}

// ideally this will give us access to both the r2 html store and to the log store.
// Note that in either case this is more of a proxy. There's no way for an sftp interface on the server to function because it wouldn't/shouldn't have the encryption key. so this only some client/proxy magic?
type Config struct {
	Sftp string
	Key  string
}

func Server1(sx *Config) {
	go func() {
		ssh.Handle(func(s ssh.Session) {
			s.User()
			if len(s.Command()) > 0 {
				for _, c := range s.Command() {
					io.WriteString(s, "I heard "+c+"\n")
				}
				return
			}
			t := term.NewTerminal(s, "> ")
			for {
				line, err := t.ReadLine()
				if err != nil {
					break
				}
				response := "I heard " + line
				log.Println(line)
				if response != "" {
					t.Write(append([]byte(response), '\n'))
				}
			}
			log.Println("terminal closed")
		})
		if true {
			ssh_server := ssh.Server{
				Addr: sx.Sftp,
				PublicKeyHandler: func(ctx ssh.Context, key ssh.PublicKey) bool {
					return true
				},
				SubsystemHandlers: map[string]ssh.SubsystemHandler{
					"sftp": SftpHandlerx,
				},
			}

			kf := ssh.HostKeyFile(sx.Key)
			kf(&ssh_server)
			log.Fatal(ssh_server.ListenAndServe())
		} else {

			log.Fatal(ssh.ListenAndServe(sx.Sftp, nil,
				ssh.HostKeyFile(sx.Key),
				ssh.PublicKeyAuth(func(ctx ssh.Context, key ssh.PublicKey) bool {
					return true
				}),
			))
		}

	}()
}

func SshStart() {
	dir, e := homedir.Dir()
	if e != nil {
		log.Fatal(e)
	}

	sx := &Config{
		Sftp: ":2022",
		// the exact key doesn't matter here, only that we don't keep changing it.
		// id_rsa of the account running the service is convenient
		Key: path.Join(dir, ".ssh/id_rsa"),
	}
	Server1(sx)
	interrupt := make(chan os.Signal, 1)
	signal.Notify(interrupt, os.Interrupt)
	<-interrupt
	log.Println("exit")
}

func SshHandler(sess ssh.Session) {
	io.WriteString(sess, "Hello world\n")
}

// SftpHandler handler for SFTP subsystem
func SftpHandlerx(sess ssh.Session) {
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
