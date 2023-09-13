package dgrtc

import (
	"io"

	"github.com/pion/webrtc/v3"
)

type SocketLike interface {
	Send([]byte) error
	Receive() ([]byte, error)
	io.Closer
}

type DataChannel struct {
	ch *webrtc.DataChannel
}

// Close implements SocketLike.
func (*DataChannel) Close() error {
	panic("unimplemented")
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

type ChannelOption func(*DataChannel)

// this initial connection requires that the bot target to trust the proxy. For better security, the bot can require the client to make a jump connection, then the bot can inspect the client's public key and decide whether to trust it.
type SshApi interface {
	// fails if target is not connected or if target doesn't accept the ssh key.
	Allow(target string, key string) error
}

func NewSshApi(ch SocketLike) *SshApi {
	return nil
}
