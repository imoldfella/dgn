package main

import (
	"datagrove/dgdb"
	"testing"
)

func Test_one(t *testing.T) {
	main()
}

// this is what we need to do to create a custom bot that processes files on a daily basis. It writes the files to a local database, backs them up to a remote database (encrypted) and it maintains a lease the right to process the files (to prevent a backup bot from running at the same time)

// schemas can define stored procedures
func Sproc1(tx *dgdb.Tx) {

}

func Test_two(t *testing.T) {
	// register in the local database

	// registering should use reflection to update the schema for configuration editor

	tx := make(chan dgdb.Tx, 256)

	dgdb.NewLocalServer(".", func(db *dgdb.LocalServer) {
		db.RegisterBot(&SampleBot{})
		db.Watch(tx)

		go func() {
			// do some basic transactions here
			tx := db.Begin()

			// ask the database to quit?
			tx.Commit()
		}()
	})

}

// Samplebot can be configured, creating more than a single bot based on flags.
// here we wake up periodically and copy files from one sftp server to another.
type SampleBot struct {
	Schedule []int
	Sftp1    string
	Sftp2    string
}

var _ dgdb.Bot = (*SampleBot)(nil)

// Attach sets up the bot to receive messages. There may be messages that were received when the bot is off line that need to be processed.
func (*SampleBot) Attach(a *dgdb.Attachment) error {
	a.OnRead(func(tx []dgdb.Tx) {
		for _, t := range tx {

			_ = t
		}

		// here we don't signal the author, since they might be offline. instead we create logs etc that the author can review later.

	})

	// we could set a cleanup message here for when we get detached.

	return nil
}

// Connect sets up an ephemeral connection from an author.
func (*SampleBot) Connect(a *dgdb.Connection) error {
	a.OnRead(func(tx []dgdb.Tx) {

		// we need to update the transaction then signal completion to the source.
		for _, t := range tx {
			a.Complete(t)
		}
	})
	return nil
}
