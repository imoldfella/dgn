package dglib

import "testing"

// we should generate code to execute transactions like
type SomeFuncData struct {
}

func SomeFunc(tx *ClientTx, o *SomeFuncData) {
	tx.Exec("somefunc", o, nil)
}

func Test_client(t *testing.T) {

	cl, e := NewClient("./data")
	if e != nil {
		t.Fatal(e)
	}
	tx, e := cl.Begin("testdb")
	if e != nil {
		t.Fatal(e)
	}
	// we need to be able to add operations (including stored procedures) to the transaction
	// the procedures need to be part of a schema. Can we check them on the client?
	SomeFunc(tx, &SomeFuncData{})

	e = tx.Commit()
	if e != nil {
		t.Fatal(e)
	}
}
