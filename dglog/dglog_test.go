package main

import (
	"datagrove/dglib"
	"os"
	"testing"
)

func Test_run(t *testing.T) {
	os.Args = []string{"dglog", "run"}
	main()
}

func Test_version(t *testing.T) {
	os.Args = []string{"dglog", "version"}
	main()
}

func Test_client1(t *testing.T) {
	go Test_run(t)

	//
	cl, e := dglib.NewClient("./clientdata")
	if e != nil {
		t.Fatal(e)
	}

	cl.CreateDb("testdb")

	tx, e := cl.Begin("testdb")
	if e != nil {
		t.Fatal(e)
	}
	_ = tx
}
