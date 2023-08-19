package dgdb

type SampleBot struct {
}

var _ Bot = (*SampleBot)(nil)

// Attach implements Bot.
func (*SampleBot) Attach(url string) error {
	panic("unimplemented")
}

// Detach implements Bot.
func (*SampleBot) Detach(url string) error {
	panic("unimplemented")
}

func SampleBotMain(cred *BotCredential) error {
	// register in the local database
	db, e := NewLocalServer()
	if e != nil {
		return e
	}
	bot := &SampleBot{}
	db.RegisterBot(bot)

	return nil
}
