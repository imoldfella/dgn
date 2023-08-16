package sshlib

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"os"
	"os/signal"
	"path"
	"strings"
	"sync"
	"time"

	"github.com/gliderlabs/ssh"
	"github.com/go-co-op/gocron"
	homedir "github.com/mitchellh/go-homedir"
	"github.com/pkg/sftp"
	"github.com/xeipuuv/gojsonschema"
	"golang.org/x/term"
)

// each task can take a configuration file as an argument and returns a string.

// ideally this will give us access to both the r2 html store and to the log store.
// Note that in either case this is more of a proxy. There's no way for an sftp interface on the server to function because it wouldn't/shouldn't have the encryption key. so this only some client/proxy magic?
type Config struct {
	Banner      string
	Url         string
	Key         string
	CompilerMap CompilerMap
	Home        string
	Data        string
}

var config *Config

// the arg can correspond to additional arguments on the command line that can be used to override and spread to the task. Can we have a generic Partial in golang like typescript?

type Task = func(arg []byte) string
type CompilerMap = map[string]func(arg []byte) (Task, error)

// every task will have a task list "run": [{ "at": "7:30am" }]
type RunTask struct {
	Every int    `json:"every,omitempty"`
	Unit  string `json:"unit,omitempty"`
	At    string `json:"at,omitempty"`
}

type BasicTask struct {
	Scheme string    `json:"$scheme,omitempty"`
	Run    []RunTask `json:"run,omitempty"`
}

// only changes at startup

type LoadState struct {
	// load from task directory
	taskmap map[string]Task //= map[string]Task{}
	// computed from task directory
	sched *gocron.Scheduler
	// potentially generated, but also loaded from schema directory
	schema map[string]*gojsonschema.Schema
	Keys   map[string]bool
}

var running *LoadState

//var  = map[string]*gojsonschema.Schema{}

// return list of errors
var mu sync.Mutex

func Load() []string {
	mu.Lock()
	defer mu.Unlock()

	tm := map[string]Task{
		"load": func(arg []byte) string {
			e := Load()
			return strings.Join(e, "\n")
		},
		"help": func(arg []byte) string {
			s := ""
			for k := range running.taskmap {
				s += k + "\n"
			}
			return s
		},
	}
	st := &LoadState{
		taskmap: tm,
		sched:   &gocron.Scheduler{},
		schema:  map[string]*gojsonschema.Schema{},
		Keys:    map[string]bool{},
	}

	fd, e := os.ReadDir(path.Join(config.Home, "keys"))
	if e != nil {
		return []string{e.Error()}
	}
	for _, f := range fd {
		if !f.IsDir() {
			o, e := os.ReadFile(path.Join(config.Home, "keys/"+f.Name()))
			if e != nil {
				continue
			}

			pk, _, _, _, err := ssh.ParseAuthorizedKey(o)
			if err != nil {
				continue
			}

			st.Keys[string(pk.Marshal())] = true
		}
	}

	sched := gocron.NewScheduler(time.UTC)
	errs := []string{}

	files, e := os.ReadDir(path.Join(config.Home, "schema"))
	if e != nil {
		errs = append(errs, e.Error())
		return errs
	}

	for _, f := range files {
		if !f.IsDir() {
			schemaLoader := gojsonschema.NewReferenceLoader("file://" + path.Join(config.Home, "schema/"+f.Name()))
			sch, e := gojsonschema.NewSchema(schemaLoader)
			if e != nil {
				errs = append(errs, e.Error())
				st.schema[f.Name()] = sch
			}
		}
	}

	tasks, e := os.ReadDir(path.Join(config.Home, "task"))
	if e != nil {
		return []string{e.Error()}
	}
	for _, f := range tasks {
		if !f.IsDir() {
			// documentLoader := gojsonschema.NewReferenceLoader(path.Join(home, f.Name()))
			b, e := os.ReadFile(path.Join(config.Home, "task/"+f.Name()))
			if e != nil {
				errs = append(errs, e.Error())
				continue
			}
			var v BasicTask
			_ = json.Unmarshal(b, &v)
			//a := strings.Split(v.Scheme, "/")
			//name := a[len(a)-1]
			stem := strings.TrimSuffix(f.Name(), path.Ext(f.Name()))
			compiler := config.CompilerMap[stem]

			if compiler == nil {
				errs = append(errs, fmt.Sprintf("unknown scheme %s for %s", v.Scheme, f.Name()))
			} else {
				task, e := compiler(b)
				if e != nil {
					errs = append(errs, e.Error())
					continue
				}

				st.taskmap[stem] = task
				// add it to the schedule
				for _, t := range v.Run {
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
						sched.Every(ev).Day().At(at).Do(func() {
							log.Printf("%s,%s", f.Name(), task(nil))
						})
					case "second":
						sched.Every(ev).Seconds().Do(func() {
							log.Printf("%s,%s", f.Name(), task(nil))
						})
					}
				}
			}
		}
	}

	// start if everything parses.
	if len(errs) == 0 {
		sched.StartAsync()

		if running != nil {
			running.sched.Stop()
		}
		running = st

		// start running a new schedule; old one will finish then stop.
		sched.StartAsync()
	}
	return errs
}

func Start(configx *Config) {
	config = configx
	e := Load()
	if len(e) > 0 {
		log.Fatal(strings.Join(e, "\n"))
	}

	if config.Key == "" {
		// the exact key doesn't matter here, only that we don't keep changing it.
		// id_rsa of the account running the service is convenient
		// user's home directory as the default.
		dir, e := homedir.Dir()
		if e != nil {
			log.Fatal(e)
		}
		config.Key = path.Join(dir, ".ssh/id_rsa")
	}

	command := func(t io.Writer, cmd string) {
		s := strings.Fields(cmd)
		task := running.taskmap[s[0]]
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
			fmt.Println(t, config.Banner)
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
				Addr: config.Url,
				PublicKeyHandler: func(ctx ssh.Context, key ssh.PublicKey) bool {
					_, ok := running.Keys[string(key.Marshal())]
					return ok
				},
				SubsystemHandlers: map[string]ssh.SubsystemHandler{
					"sftp": SftpHandlerx,
				},
			}

			kf := ssh.HostKeyFile(config.Key)
			kf(&ssh_server)
			log.Fatal(ssh_server.ListenAndServe())
		}

	}()

	interrupt := make(chan os.Signal, 1)
	signal.Notify(interrupt, os.Interrupt)
	<-interrupt
	log.Println("exit")
}

func SshHandler(sess ssh.Session) {
	io.WriteString(sess, "Hello world\n")
}

// SftpHandler handler for SFTP subsystem
// we need to change the directory to the data directory.
func SftpHandlerx(sess ssh.Session) {
	os.Chdir(config.Data)
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
