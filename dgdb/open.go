package dgdb

import (
	"datagrove/dgrtc"
	"encoding/json"
	"os"
)

type Credential []byte

// a local server can allow different local clients to share data offline.
// it is optional, the service worker can
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

// we need to listen for incoming webrtc connections.
// ideally we don't need datagrove to get connections from local clients
func NewService(home string, opt ...Plugin) {
	var cfg Config
	b, e := os.ReadFile(home + "/config.json")
	if e != nil {

	} else {
		json.Unmarshal(b, &cfg)
	}

	r := &LocalServer{}
	for _, p := range opt {
		p(r)
	}

	// start the server. create a datachannel to datagrove. Listen for incoming chats.
	// when incoming chat, then create a new datachannel directly to the chatter if 1-1. if

	// connect to the lobby and wait for datachannel requests.

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
