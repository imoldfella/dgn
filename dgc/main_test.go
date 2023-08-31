package main

import (
	"datagrove/dgdb"
	"fmt"
	"os"
	"testing"

	v8 "rogchap.com/v8go"
)

// start both the central server and a local server for testing
func Test_basic(t *testing.T) {

	// the central server
	os.Args = []string{"dgc", "basic", "."}
	main()
}

func Test_client(t *testing.T) {
	home := "."

	go dgdb.NewLocalServer(home)
	go dgdb.ClusterServer(home)

	// create a client that connects to the local server and accesses the BasicServer through the cluster server.
	// how does oath work in this case though? Do we auth with the local server? how is the local server managed in a PWA?
	// only the cluster server can do oauth (easily) because secrets.
	// the local server needs to be replicated in a service worker, service worker being able to be the local server, or (somehow) delegating to a an installed local server.

}

// this is what we need to do to create a custom bot that processes files on a daily basis. It writes the files to a local database, backs them up to a remote database (encrypted) and it maintains a lease the right to process the files (to prevent a backup bot from running at the same time)

// schemas can define stored procedures
// the values returned are only value if commit is successful.
// how should we define the stored procedures? Typescript seems like the most versatile choice.

// stored procedures can be inserted into a javascript run time, then called.
// we can use a node like interface to execute remotely.
// we can use typescript to define the stored procedures.
type Sproc1 struct {
}

func (s *Sproc1) Exec(tx *dgdb.Tx) {

}

// Samplebot can be configured, creating more than a single bot based on flags.
// here we wake up periodically and copy files from one sftp server to another.
type SampleBot struct {
	Schedule []int
	Sftp1    string
	Sftp2    string
}

func Test_v8(t *testing.T) {
	ctx := v8.NewContext()
	ctx.RunScript("const add = (a, b) => a + b", "math.js") // executes a script on the global context
	ctx.RunScript("const result = add(3, 4)", "main.js")    // any functions previously added to the context can be called
	val, _ := ctx.RunScript("result", "value.js")           // return a value in JavaScript back to Go
	fmt.Printf("addition result: %s", val)
}
func Test_v8b(t *testing.T) {
	iso := v8.NewIsolate() // create a new VM
	// a template that represents a JS function
	printfn := v8.NewFunctionTemplate(iso, func(info *v8.FunctionCallbackInfo) *v8.Value {
		fmt.Printf("%v", info.Args()) // when the JS function is called this Go callback will execute
		return nil                    // you can return a value back to the JS caller if required
	})
	global := v8.NewObjectTemplate(iso)       // a template that represents a JS Object
	global.Set("print", printfn)              // sets the "print" property of the Object to our function
	ctx := v8.NewContext(iso, global)         // new Context with the global Object set to our object template
	ctx.RunScript("print('foo')", "print.js") // will execute the Go callback with a single argunent 'foo'
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
