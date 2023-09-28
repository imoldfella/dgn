package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"runtime"
	"sync"

	"github.com/kardianos/service"
	"github.com/spf13/cobra"
)

var logger service.Logger
var runList = []string{}
var dir string = "."
var bucket string = "Production"

type program struct {
	exit chan struct{}
}

func (p *program) Start(s service.Service) error {
	// Start should not block. Do the actual work async.

	return nil
}
func (p *program) Stop(s service.Service) error {
	close(p.exit)
	return nil
}

var mu sync.Mutex

const page = `
<html>
<head>
<title>lobby</title>
</head>
<body>
<h1>lobby</h1>
</body>
</html>
`

func startServer() {
	root := func(w http.ResponseWriter, r *http.Request) {

		fmt.Fprintf(w, page)
	}

	http.HandleFunc("/", root)

	http.HandleFunc("/whip", func(w http.ResponseWriter, r *http.Request) {
		// start a data channel to the lobby
	})

	log.Fatal(http.ListenAndServe(":5093", nil))

}

func main() {
	var version = &cobra.Command{
		Use:   "version",
		Short: "report version",
		Run: func(cmd *cobra.Command, args []string) {
			log.Print("version 0.0.1")
		},
	}

	var install = &cobra.Command{
		Use:   "install [dir] [name]",
		Short: "Install the service",
		Run: func(cmd *cobra.Command, args []string) {
			name := "dglobby"
			if len(args) > 0 {
				dir = args[0]
			}
			if len(args) > 1 {
				name = args[1]
			}
			if runtime.GOOS == "windows" {
				ex, err := os.Executable()
				if err != nil {
					panic(err)
				}
				cmd := fmt.Sprintf("sc create %s binPath= \"%s run %s\"", name, ex, dir)
				log.Printf("installing %s", cmd)
				e := exec.Command(cmd).Run()
				if e != nil {
					log.Fatal(e)
				}
				exec.Command(fmt.Sprintf("sc start %s", name)).Run()
			}
		},
	}
	var uninstall = &cobra.Command{
		Use:   "uninstall [name]",
		Short: "Uninstall the service",
		Run: func(cmd *cobra.Command, args []string) {
			name := "aetna1199"
			if len(args) > 0 {
				name = args[0]
			}
			if runtime.GOOS == "windows" {
				exec.Command(fmt.Sprintf("sc stop %s", name)).Run()
				exec.Command(fmt.Sprintf("sc delete %s", name)).Run()
			}
		},
	}
	var run = &cobra.Command{
		Use:   "run [dir]",
		Short: "Run the process",
		Run: func(cmd *cobra.Command, args []string) {
			prg := &program{}
			svcConfig := &service.Config{
				Name:        "dglobby",
				DisplayName: "dglobby",
				Description: "dglobby",
			}
			s, err := service.New(prg, svcConfig)
			startServer()
			if err != nil {
				log.Fatal(err)
			}

			err = s.Run()
			if err != nil {
				logger.Error(err)
			}
		},
	}
	var rootCmd = &cobra.Command{Use: "app"}
	rootCmd.AddCommand(version)
	rootCmd.AddCommand(run)
	rootCmd.AddCommand(install)
	rootCmd.AddCommand(uninstall)

	if err := rootCmd.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}

}
