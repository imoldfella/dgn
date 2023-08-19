package dgdb

import "io"

// bots exist the in the context of a local database
// bots are authors.

// deal with the credential in database before calling
type Bot interface {
	Attach(url string) error
	Detach(url string) error
}
type BotOption struct {
}

type Credential []byte
type BotCredential struct {
	Url string
}

type LocalServer struct {
	grove map[uint32]*Datagrove
}

func (s *LocalServer) RegisterBot(bot Bot, opt ...BotOption) error {
	return nil
}

func NewLocalServer() (*LocalServer, error) {
	return nil, nil
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
