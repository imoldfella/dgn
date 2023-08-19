package dgdb

import "io"

// bots exist the in the context of a local database

type Server interface {
	Send(follower Follower, data []byte) error
}

type LocalServer struct {
}

type Committer interface {
	Commit() error
}

type Tx struct {
}

type Txi struct {
	Committer
	io.Closer
}

func (tx *Tx) Commit() error {
	return nil
}
func (tx *Tx) Close() error {
	return nil
}

func NewTx(db *LocalServer) *Tx {
	return nil
}

type Datagrove interface {
	Connect(did string, cb Callback)
	Publish(data []byte) error
	AcceptFollow(follower Follower) error
	RequestFollow(follower Follower) error
}
type Callback interface {
	RequestFollow(follower Follower) error
}

type BasicDatagrove struct {
}

func NewServer() (*Datagrove, error) {
	return nil, nil
}

type Follower struct {
	Handle int
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

// a Subscription can be a statement that we execute to subscribe to a channel

type Signal interface {
	addListener(f func()) func()
	removeListener(f func()) error
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
