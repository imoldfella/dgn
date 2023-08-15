package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"os"
	"os/signal"
	"path"
	"strings"
	"time"

	"github.com/gliderlabs/ssh"
	"github.com/go-co-op/gocron"
	homedir "github.com/mitchellh/go-homedir"
	"github.com/pkg/sftp"
	"github.com/xeipuuv/gojsonschema"
	"golang.org/x/term"
)

// the arg can correspond to additional arguments on the command line that can be used to override and spread to the task. Can we have a generic Partial in golang like typescript?

type Task = func(arg []byte) string

var taskmap map[string]Task = map[string]Task{}
var compilerMap map[string]func(arg []byte) (Task, error) = map[string]func(arg []byte) (Task, error){}
var running *gocron.Scheduler = nil
var home string = "."
var schema map[string]*gojsonschema.Schema = map[string]*gojsonschema.Schema{}

type TestUser struct {
	Scheme      string                 `json:"$scheme,omitempty"`
	Run         []RunTask              `json:"run,omitempty"`
	ID          int                    `json:"id"`
	Name        string                 `json:"name" jsonschema:"title=the name,description=The name of a friend,example=joe,example=lucy,default=alex"`
	Friends     []int                  `json:"friends,omitempty" jsonschema_description:"The list of IDs, omitted when empty"`
	Tags        map[string]interface{} `json:"tags,omitempty" jsonschema_extras:"a=b,foo=bar,foo=bar1"`
	BirthDate   time.Time              `json:"birth_date,omitempty" jsonschema:"oneof_required=date"`
	YearOfBirth string                 `json:"year_of_birth,omitempty" jsonschema:"oneof_required=year"`
	Metadata    interface{}            `json:"metadata,omitempty" jsonschema:"oneof_type=string;array"`
	FavColor    string                 `json:"fav_color,omitempty" jsonschema:"enum=red,enum=green,enum=blue"`
}

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

func main() {
	// each task corresponds to a json file in the task directory.
	compilerMap = map[string]func(arg []byte) (Task, error){
		"user": func(config []byte) (Task, error) {
			var tu TestUser
			e := json.Unmarshal(config, &tu)
			if e != nil {
				return nil, e
			}
			return func(arg []byte) string {
				return string(config)
			}, nil
		},
	}

	if len(os.Args) > 1 {
		home = os.Args[1]
	} else {
		home, _ = os.Getwd()
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
	sched := gocron.NewScheduler(time.UTC)
	errs := []string{}

	files, e := os.ReadDir(path.Join(home, "schema"))
	if e != nil {
		errs = append(errs, e.Error())
		return errs
	}

	for _, f := range files {
		if !f.IsDir() {
			schemaLoader := gojsonschema.NewReferenceLoader("file://" + path.Join(home, "schema/"+f.Name()))
			sch, e := gojsonschema.NewSchema(schemaLoader)
			if e != nil {
				errs = append(errs, e.Error())
				schema[f.Name()] = sch
			}
		}
	}

	tasks, e := os.ReadDir(path.Join(home, "task"))
	if e != nil {
		return []string{e.Error()}
	}
	for _, f := range tasks {
		if !f.IsDir() {
			// documentLoader := gojsonschema.NewReferenceLoader(path.Join(home, f.Name()))
			b, e := os.ReadFile(path.Join(home, "task/"+f.Name()))
			if e != nil {
				errs = append(errs, e.Error())
				continue
			}
			var v BasicTask
			_ = json.Unmarshal(b, &v)
			//a := strings.Split(v.Scheme, "/")
			//name := a[len(a)-1]
			stem := strings.TrimSuffix(f.Name(), path.Ext(f.Name()))
			compiler := compilerMap[stem]

			if compiler == nil {
				errs = append(errs, fmt.Sprintf("unknown scheme %s for %s", v.Scheme, f.Name()))
			} else {
				task, e := compiler(b)
				if e != nil {
					errs = append(errs, e.Error())
					continue
				}

				taskmap[stem] = task
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

	// everything parses.
	if len(errs) == 0 {
		sched.StartAsync()

		if running != nil {
			running.Stop()
		}
		running = sched

		// start running a new schedule; old one will finish then stop.
		sched.StartAsync()
	}
	return errs
}

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
