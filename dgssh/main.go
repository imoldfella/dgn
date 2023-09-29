package main

import (
	"datagrove/dgrtc"

	"github.com/kardianos/service"
)

type program struct {
	exit chan struct{}
}

type MultiPacket struct {
	Channel int // 0 is the control channel
	Payload []byte
}

func (p *program) Start(s service.Service) error {

	cap, e := dgrtc.LoadCapability("data/server")
	if e != nil {
		return e
	}

	ls, err := dgrtc.NewLobbyClient("localhost:5093")
	if err != nil {
		return err
	}
	cn, e := ls.Listen(cap)
	if e != nil {
		return e
	}
	// Start should not block. Do the actual work async.
	go func() {
		for {
			dc, e := cn.Accept()
			if e != nil {
				continue
			}
			defer dc.Close()
			// we need to receive the initial handshake, which may indicate that we should make a channel on an existing connection.
			go func() {

				for {
					// we can multiplex ssh channels over a single data channel, but do we want to? it's cheaper for the lobby if we do this.
					// what of hol blocking? file transfer? database client?

					if e != nil {
						return
					}

				}
			}()
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
