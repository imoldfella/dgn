package dglib

type Dbhttp struct {
	leader string // empty if we are the leader.
	w      chan []byte
}

const (
	Insert = iota
)

type Tx struct {
	Op     []byte
	Params [][]byte
}

func NewDb(dir string) *Dbhttp {
	return &Dbhttp{}
}

func (db *Dbhttp) Commit(tx *Tx) {

}

func (db *Dbhttp) Append(tx *Tx) {

}
