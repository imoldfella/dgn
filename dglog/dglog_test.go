package main

import (
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
