package dgdb

// webrtc to accept followers from a datagrove cluster

type Lobby interface {
	AcceptFollow(follower Author) error
}

type Writer interface {
}

type Datagrove interface {
	// connect creates a datachannel to the server.
	// we only need to claim authorship if we want to publish.
	// we might get connected to a tree of writers, or we might be the root in charge of a tree of writers.
	ClaimAuthor(did string) (Writer, error)

	Commit(page Tx) error

	RequestFollow(follower Author) error
}

type Callback interface {
	RequestFollow(follower Author) error
}
type Author struct {
	Handle int
}

type BasicDatagrove struct {
}

func (d *BasicDatagrove) ClaimAuthor(did string) (Author, error) {
	return Author{}, nil
}

func NewServer(did string) (*Datagrove, error) {
	return nil, nil
}
