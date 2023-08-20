package dgdb

import "io"

type Credential []byte

type LocalServer struct {
	grove map[uint32]*Datagrove
}

func (s *LocalServer) RegisterBot(bot Bot, opt ...BotOption) error {
	return nil
}

func NewLocalServer(home string) (*LocalServer, error) {
	return nil, nil
}

type Committer interface {
	Commit() error
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

type SampleSub struct {
	Signal
}

func (s *SampleSub) Exec(tx *Tx) error {
	return nil
}
func (s *SampleSub) Close(tx *Tx) error {
	return nil
}
