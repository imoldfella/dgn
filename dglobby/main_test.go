package main

import (
	"datagrove/dgrtc"
	"os"
	"testing"
	"time"

	"github.com/kardianos/service"
)

func client1() error {

	return nil
}

func Test_one(t *testing.T) {
	os.Args = []string{"dglobby", "run"}
	go main()

	cap, e := dgrtc.NewSite()
	if e != nil {
		t.Fatal(e)
	}
	go func() {
		e := host1()
		if e != nil {
			t.Fatal(e)
		}
	}()
	time.Sleep(500 * time.Millisecond)
	e := client1()
	if e != nil {
		t.Fatal(e)
	}
}

func host1(serverCap *dgrtc.Capability) error {

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
