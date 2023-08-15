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
	"github.com/go-co-op/gocron"
	homedir "github.com/mitchellh/go-homedir"
	"github.com/pkg/sftp"
	"github.com/xeipuuv/gojsonschema"
	"golang.org/x/term"
)

// the arg can correspond to additional arguments on the command line that can be used to override and spread to the task. Can we have a generic Partial in golang like typescript?

var taskmap map[string]func(arg string) string

var running *gocron.Scheduler
var home string = "."

// every task will have a task list "run": [{ "at": "7:30am" }]
type Task struct {
	Every int    `json:"every,omitempty"`
	Unit  string `json:"unit,omitempty"`
	At    string `json:"at,omitempty"`
}

type Schedule struct {
	Run []Task `json:"run,omitempty"`
}
type Sample struct {
	Schedule
}

func main() {
	// each task corresponds to a json file in the task directory.
	if len(os.Args) > 1 {
		home = os.Args[1]
	}

	f := Load()
	if len(f) > 0 {
		for _, e := range f {
			log.Println(e)
		}
		return
	}

	SshStart()
}

// return list of errors
func Load() []string {
	err := []string{}
	sl := gojsonschema.NewSchemaLoader()
	
	files, e := os.ReadDir(path.Join(home, "schema"))
	if e != nil {
		err = append(err, e.Error())
	} else {
		for _, f := range files {
			if !f.IsDir() {
				schemaLoader := gojsonschema.NewReferenceLoader(path.Join(home, f.Name()))
				schema, err := gojsonschema.NewSchema(schemaLoader)
				if err != nil {
					err = append(err, err.Error())
				schema[f.Name()] = schema
			}
		}
	}

	tasks, e := os.ReadDir(path.Join(home, "task"))
	if e != nil {
		return nil, e
	}
	for _, f := range tasks {
		if !f.IsDir() {
			// documentLoader := gojsonschema.NewReferenceLoader(path.Join(home, f.Name()))
			// result, err := gojsonschema.Validate(schemaLoader, documentLoader)
			// if err != nil {
			// 	return f.Name(), err
			// }
			
		}
	}
	return nil, nil
}

/*
	var tl TaskList
	// load the schedule
	err := json.Unmarshal(config, &tl)
	if err != nil {
		return err
	}

	s := gocron.NewScheduler(time.UTC)
	for _, t := range tl.Tasks {
		if taskmap[t.Do] == nil {
			return fmt.Errorf("unknown task %s", t.Do)
		}
		ev := t.Every
		if ev < 1 {
			ev = 1
		}
		at := t.At
		if at == "" {
			at = "00:00"
		}
		unit := t.Unit
		if unit == "" {
			unit = "day"
		}

		switch unit {
		case "day":
			s.Every(ev).Day().At(at).Do(taskmap[t.Do])
		case "second":
			s.Every(ev).Seconds().Do(taskmap[t.Do])
		}
	}

	// everything parses.
	s.StartAsync()

	if running != nil {
		running.Stop()
	}
	running = s

	// start running a new schedule; old one will finish then stop.
	s.StartAsync()
	return nil
}
*/

// each task can take a configuration file as an argument and returns a string.

// ideally this will give us access to both the r2 html store and to the log store.
// Note that in either case this is more of a proxy. There's no way for an sftp interface on the server to function because it wouldn't/shouldn't have the encryption key. so this only some client/proxy magic?
type Config struct {
	Sftp string
	Key  string
}

func CommandLine(sx *Config) {
	command := func(t io.Writer, cmd string) {
		s := strings.Fields(cmd)
		task := taskmap[s[0]]
		if task == nil {
			fmt.Fprintf(t, "unknown command %s\n", s[0])
			return
		}
		var b []byte = nil
		if len(s) > 1 {
			bx, e := os.ReadFile(s[1])
			if e != nil {
				fmt.Fprintf(t, "error reading %s: %s\n", s[1], e)
				return
			}
			b = bx
		}
		response := task(b)
		io.WriteString(t, response+"\n")
	}

	go func() {
		ssh.Handle(func(s ssh.Session) {
			t := term.NewTerminal(s, "> ")

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
			// without sftp
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
	CommandLine(sx)
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

/*
	"daily": func(arg []byte) string {
		var v struct {
			Version int64 `json:"version,omitempty"`
		}
		if arg == nil {
			v.Version = 1
		} else {
			e := json.Unmarshal(arg, &v)
			if e != nil {
				return e.Error()
			}
		}

		o, _ := json.Marshal(&v)
		return string(o)
	},
	"restart": func(arg []byte) string {
		e := Load(arg)
		if e != nil {
			return e.Error()
		} else {
			return "ok"
		}
	},
*/
