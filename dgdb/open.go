package dgdb

import (
	"datagrove/dgrtc"
	"encoding/json"
	"log"
	"os"
)

type Credential []byte

type LocalServer struct {
	grove map[uint32]*LeaseApi
}

func (s *LocalServer) RegisterBot(bot Bot, opt ...BotOption) error {
	return nil
}

type Plugin func(db *LocalServer)

type Config struct {
	Datagrove []string
}

type State struct {
	Datagrove []dgrtc.SocketLike
}

func NewClusterServer(home string, opt ...Plugin) {

}

// we need to listen for incoming connections.
// ideally we don't need datagrove to get connections from local clients
// maybe we also provide some version of the client as well here.
// maybe dgd gets all its functionality from here?
func NewLocalServer(home string, opt ...Plugin) {
	var cfg Config
	b, e := os.ReadFile(home + "/config.json")
	if e != nil {
		log.Fatal(e)
	}
	json.Unmarshal(b, &cfg)

	r := &LocalServer{}
	for _, p := range opt {
		p(r)
	}

	// start the server. create a datachannel to datagrove. Listen for incoming chats.
	// when incoming chat, then create a new datachannel directly to the chatter if 1-1. if
	for {
		//
	}
}

func (s *LocalServer) Watch(tx chan Tx) {
}

func (db *LocalServer) Begin() *Tx {
	return &Tx{
		LocalServer: db,
	}
}

type Statement interface {
	Exec(tx *Tx) error
}

type Db struct {
}

// the database

/* maybe just insert/delete?
AddSlice(db Database) error
RemoveSlice(db Database) error
*/

type SampleStatement struct {
	A int
}

func (s *SampleStatement) Exec(tx *Tx) error {
	return nil
}

type SampleSub struct {
	Signal
}

func (s *SampleSub) Exec(tx *Tx) error {
	return nil
}
func (s *SampleSub) Close(tx *Tx) error {
	return nil
}
