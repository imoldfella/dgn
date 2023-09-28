package dgrtc

type LobbyClient struct {
}
type Keypair struct {
}

const (
	CapOwn = iota
	CapServer
	CapRead
	CapWrite
)

// this is the public key of the owning keypair.
type Channel []byte

type Capability struct {
	PublicKey []byte
	Cap       int
	Proof     []byte //
}

type Listener struct {
}

func (l *Listener) Accept() (*DataChannel, error) {
	return nil, nil
}

func (l *Listener) Close() error {
	return nil
}

func NewLobbyClient(address string) (*LobbyClient, error) {
	return nil, nil
}

// must be a server capability
func Listen(lc *LobbyClient, kp *Capability) (*Listener, error) {
	return nil, nil
}

// the keypair here can be anonymous capability issued by the host.
// the lobby needs to be able to validate the
func Dial(lc *LobbyClient, kp *Capability) (*DataChannel, error) {
	return nil, nil
}

/*
// when we listen we might want to listen to more than one channel.
func Listen(id *Identity, config *Config) (*DataChannel, error) {
	lb, e := SignalChannel(id.Host(), config)
	if e != nil {
		return nil, e
	}
	// send a message to the signaling server that we are willing to accept a connections for specific channels, and validate our authority to do so.
	// the channel can be identified by a public key (in a transparent log) and then the listener can prove it has the private key by signing a challenge.
	lb.Send([]byte("hello"))
	go func() {
		for {
			b, e := lb.Receive()
			if e != nil {
				panic(e)
			}
			fmt.Printf("received: %s\n", b)
		}
	}()
	return nil, nil
}
*/
