package main

import "os"

func Test_run() {
	os.Args = []string{"dgf", "run"}
	main()
}
