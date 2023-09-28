package main

import (
	"os"
	"testing"
)

func Test_one(t *testing.T) {
	os.Args = []string{"dglobby", "run"}
	main()
}
