package dgdb

// bots exist the in the context of a local database
// bots are authors.

// connections are ephemeral
type Connection struct {
	SignalContext
}

func (c *Connection) Complete(tx Tx) {
}

type Attachment struct {
	SignalContext
}

func (*Attachment) OnRead(func([]Tx)) {

}
func (*Connection) OnRead(func([]Tx)) {

}

// deal with the credential in database before calling
type Bot interface {
	Attach(*Attachment) error
	Connect(*Connection) error
}
type BotOption struct {
}
type BotCredential struct {
	Url string
}
