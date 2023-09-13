package dgrtc

import (
	"log"
	"net/http"
	"testing"
)

// create a pion/pion connection

func Test_one(t *testing.T) {
	db := NewSimpleIdentityDatabase()
	id, e := db.Get("bot@localhost:8081")
	if e != nil {
		t.Fatal(e)
	}

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
		cn, e := NewDataChannel(id, nil)
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
// func Answer(kp *KeyPair) ChannelOption {
// 	return func(*DataChannel) {

// 	}
// }
// func Offer(kp *KeyPair) ChannelOption {
// 	return func(*DataChannel) {

// 	}
// }
