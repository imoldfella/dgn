package webrtc

type SocketLike interface {
	Send([]byte) error
	Receive() ([]byte, error)
}

type DataChannel struct {
}

// Receive implements SocketLike.
func (*DataChannel) Receive() ([]byte, error) {
	panic("unimplemented")
}

// Send implements SocketLike.
func (*DataChannel) Send([]byte) error {
	panic("unimplemented")
}

var _ SocketLike = (*DataChannel)(nil)

func NewDataChannel(addr string) (*DataChannel, error) {
	return nil, nil
}
