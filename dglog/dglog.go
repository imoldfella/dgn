package main

import (
	"log"
	"os"

	"github.com/kardianos/service"
	"github.com/spf13/cobra"
)

var directory = "./data"
var logger service.Logger

type program struct{}

func (p *program) Start(s service.Service) error {
	// Start should not block. Do the actual work async.
	go p.run()
	return nil
}

func (p *program) run() {
	e := startup(directory)
	if e != nil {
		log.Fatal(e)
	}

}
func (p *program) Stop(s service.Service) error {
	// Stop should not block. Return with a few seconds.
	return nil
}

func main() {
	name := "dglog"
	dir, e := os.UserHomeDir()
	if e != nil {
		log.Fatal(e)
	}
	dir += "/.dglog"
	var rootCmd = &cobra.Command{
		Use:   "dglog",
		Short: "dglog 0.1",
	}
	rootCmd.AddCommand(&cobra.Command{
		Use:   "uninstall [name]",
		Short: "Uninstall the service",
		Run: func(cmd *cobra.Command, args []string) {
			if len(args) > 0 {
				name = args[0]
			}
			s, err := service.New(&program{}, &service.Config{
				Name: name,
			})
			if err != nil {
				log.Fatal(err)
			}
			err = s.Uninstall()
			if err != nil {
				log.Fatal(err)
			}
		},
	})
	rootCmd.AddCommand(&cobra.Command{
		Use:   "install [dir] [name]",
		Short: "install the service",
		Run: func(cmd *cobra.Command, args []string) {
			if len(args) > 0 {
				name = args[0]
			}
			s, err := service.New(&program{}, &service.Config{
				Name: name,
			})
			if err != nil {
				log.Fatal(err)
			}
			err = s.Uninstall()
			if err != nil {
				log.Fatal(err)
			}
		},
	})

	rootCmd.AddCommand(&cobra.Command{
		Use:   "run",
		Short: "run [dir]",
		Run: func(cmd *cobra.Command, args []string) {

			if len(args) > 0 {
				directory = args[0]
			}
			svcConfig := &service.Config{
				Name:        "GoServiceTest",
				DisplayName: "Go Service Test",
				Description: "This is a test Go service.",
			}

			prg := &program{}
			s, err := service.New(prg, svcConfig)
			if err != nil {
				log.Fatal(err)
			}
			logger, err = s.Logger(nil)
			if err != nil {
				log.Fatal(err)
			}
			err = s.Run()
			if err != nil {
				logger.Error(err)
			}

		},
	})
	rootCmd.Execute()
}
