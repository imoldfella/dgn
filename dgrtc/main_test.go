package dgrtc

import (
	"log"
	"net/http"
	"testing"
)

// create a pion/pion connection

func Test_one(t *testing.T) {

	// start a signaling server; it will take pion/pion connections and create datachannels.
	go func() {
		mux := http.NewServeMux()
		AddHandlers(mux)
		log.Fatal((&http.Server{
			Handler: mux,
			Addr:    "localhost:8080",
		}).ListenAndServe())
	}()

	// start a service.
	go func() {
		cn, e := NewDataChannel("bot@localhost:8081")
		if e != nil {
			log.Fatal(e)
		}
		for {
			_, e := cn.Receive()
			if e != nil {
				log.Fatal(e)
			}
		}

	}()

	// connect to the service. in general use this expands to allow us to read data directly from the cluster, and to potentially become a writer service

	// kp, e : = NewKeyPair()
	// if e != nil {
	// 	t.Fatal(e)
	// }

	NewDataChannel("bot@localhost")

}

// these public keys protect the operation; the key is sent to the server, stored on the server. we have to send a challenge to encrypt.
type ChannelCaps struct {
	Read  []byte
	Write []byte
	Serve []byte
}
type ServerCaps struct {
	Challenge []byte
}
type ConnectRequest struct {
	ChannelCaps
}
type ConnectResponse struct {
}

// option to answer on channel as well as offer.
// we need to use some kind of grant to allow the connection to the cluster read/write+weight
// the
func Answer(kp *KeyPair) ChannelOption {
	return func(*DataChannel) {

	}
}
func Offer(kp *KeyPair) ChannelOption {
	return func(*DataChannel) {

	}
}

// maybe move this test to dgdb
func Test_two(t *testing.T) {

	// we probably need some kind of auth server interface.
	// start a signaling server; it will take pion/pion connections and create datachannels.
	go func() {
		mux := http.NewServeMux()
		// these will let clients connect directly to cluster
		// they can use that connection with an api to connect to other channels.
		// I think we need some plugins or callback here?
		AddHandlers(mux)

		log.Fatal((&http.Server{
			Handler: mux,
			Addr:    "localhost:8080",
		}).ListenAndServe())
	}()

	kp, _ := NewKeyPair()
	// start a service or a client. the first one to connect will become the service, the next one will become the client. The cluster must authenticate that the proposed writer is allowed to become the writer, and to adjudicate the superior writer if there is more than one.
	for x := 0; x < 2; x++ {
		go func() {
			cn, e := NewDataChannel("bot@localhost:8080", Answer(kp))
			if e != nil {
				log.Fatal(e)
			}
			for {
				_, e := cn.Receive()
				if e != nil {
					log.Fatal(e)
				}
			}
		}()
	}

	// connect to the service. in general use this expands to allow us to read data directly from the cluster, and to potentially become a writer service

	// kp, e : = NewKeyPair()
	// if e != nil {
	// 	t.Fatal(e)
	// }

}
