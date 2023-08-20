	// start a terminal
	bot, e := ConnectBot(os.Args[1])
	if e != nil {
		log.Fatal(e)
	}
	stdin_reader, _ := io.Pipe()
	reader := bufio.NewReader(stdin_reader)

	stdout_writer := bytes.Buffer{}
	writer := bufio.NewWriter(&stdout_writer)

	rw := bufio.NewReadWriter(reader, writer)
	t := term.NewTerminal(rw, "> ")

	// constantly be reading lines
	go func() {
		for {
			line, err := t.ReadLine()
			if err == io.EOF {
				log.Printf("got EOF")
			}
			if err != nil {
				log.Printf("got err")
			}
			if line == "" {
				continue
			}
			s, e := bot.Output(line)
			if e != nil {
				log.Fatal(e)
			}
			fmt.Printf(string(s))
		}
	}()