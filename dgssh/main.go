package main

import (
	"datagrove/dgrtc"

	"github.com/kardianos/service"
)

// an SSH proxy that runs over a data channel.

type program struct {
	exit chan struct{}
}

func (p *program) Start(s service.Service) error {
	var x dgrtc.Capability
	ls, err := dgrtc.NewLobbyClient("localhost:5093")
	if err != nil {
		return err
	}
	// Start should not block. Do the actual work async.
	go func() {

		for {

		}
	}()
	return nil
}
func (p *program) Stop(s service.Service) error {
	close(p.exit)
	return nil
}

// this could be a service so it stays up.
func main() {

}
