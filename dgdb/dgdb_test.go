package dgdb

// this test connects to a dgd, then we can use ssh proxy to execute
// this requires dgdb (the bot), dgd (the cluster) and dgc (the client/proxy) and potentially other ssh based tools like ssh and sftp.

// Samplebot can be configured, creating more than a single bot based on flags.
type SampleBot struct {
	Snark int `json:"snark,omitempty"`
}

var _ Bot = (*SampleBot)(nil)

// Attach sets up the bot to receive messages. There may be messages that were received when the bot is off line that need to be processed.
func (*SampleBot) Attach(a *Attachment) error {
	a.OnRead(func(tx []Tx) {
		for _, t := range tx {

			_ = t
		}

		// here we don't signal the author, since they might be offline. instead we create logs etc that the author can review later.

	})

	// we could set a cleanup message here for when we get detached.

	return nil
}

// Connect sets up an ephemeral connection from an author.
func (*SampleBot) Connect(a *Connection) error {
	a.OnRead(func(tx []Tx) {

		// we need to update the transaction then signal completion to the source.
		for _, t := range tx {
			a.Complete(t)
		}
	})
	return nil
}

// start with the path to the configuration
// the configuration file can also specify time based bot tasks
func SampleBotMain(path string) error {
	// Write a schema for the bot configuration

	// register in the local database
	db, e := NewLocalServer()
	if e != nil {
		return e
	}
	bot := &SampleBot{}
	db.RegisterBot(bot)

	return nil
}
