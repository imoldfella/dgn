package dgrtc

import (
	"log"
	"net/http"
	"testing"
)

// we need two kinds of channel? one is dm, one is pub/sub.
//

func Test_one(t *testing.T) {
	// in general we need some ceremony or password to open an identity database
	db := NewSimpleIdentityDatabase()
	id, e := db.Get("bot@localhost:8081")
	if e != nil {
		t.Fatal(e)
	}

	// start a signaling cluster; it will take pion/pion connections and create datachannels.
	go func() {
		mux := http.NewServeMux()
		AddHandlers(mux)
		log.Fatal((&http.Server{
			Handler: mux,
			Addr:    "localhost:8080",
		}).ListenAndServe())
	}()

	// start a local server.
	go func() {
		cn, e := Listen(id, nil)
		if e != nil {
			log.Fatal(e)
		}
		for {
			b, e := cn.Receive()
			if e != nil {
				log.Fatal(e)
			}
			cn.Send(b)
		}
	}()

	// connect to the local server through the signaling cluster.

	idc, e := db.Get("client@localhost:8080")
	cn, e := Dial(idc, id, nil)
	cn.Send([]byte("hello"))
	b, e := cn.Receive()
	if e != nil {
		t.Fatal(e)
	}
	if string(b) != "hello" {
		t.Fatal("bad echo")
	}

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
