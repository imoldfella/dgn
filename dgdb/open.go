package dgdb

type Credential []byte

type LocalServer struct {
	grove map[uint32]*Datagrove
}

func (s *LocalServer) RegisterBot(bot Bot, opt ...BotOption) error {
	return nil
}

type Plugin func(db *LocalServer)

func NewLocalServer(home string, opt ...Plugin) {
	r := &LocalServer{}
	for _, p := range opt {
		p(r)
	}
	// start the server.
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
