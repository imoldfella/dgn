package dgdb

import (
	"encoding/json"
	"os"
	"path"
)

// the basic structure of a bot is something that responds to events (eg time) and generates data.
// the events can also be commands from authorized users. so service + cli.

// Json structure of options for the 1199 job.
// compose of normal things like directories etc.
type Daily1199 struct {
}

func main() {
	var home string
	if len(os.Args) > 1 {
		home = os.Args[1]
	} else {
		home, _ = os.Getwd()
		home = path.Join(home, "home")
	}

	// each task corresponds to a json file in the task directory.
	// v2 will build the compiler map from golang scripts/git repos directly. this will require an extra level of indirection as we isolate the generated task in a process.
	compilerMap := map[string]func(arg []byte) (Task, error){
		"1199": func(config []byte) (Task, error) {
			var tu Daily1199
			e := json.Unmarshal(config, &tu)
			if e != nil {
				return nil, e
			}
			return func(_ *TaskContext) string {
				return "daily 1199 processing"
			}, nil
		},
	}
	var sx Config = Config{
		Home:        home,
		CompilerMap: compilerMap,
	}
	WriteSchemas := func(dir string) {

	}
	b, e := os.ReadFile(home + "/config.json")
	if e != nil {
		os.MkdirAll(home, 0755)
		os.MkdirAll(home+"/data", 0755)
		os.MkdirAll(home+"/keys", 0755)
		os.MkdirAll(home+"/schema", 0755)

		// write the schema for the commands in this executable
		// we need to run this again whenever we update the executable.
		WriteSchemas(home + "/schema")

		sx.Options = Options{
			Banner: "Aetna-1199 Server",
			Url:    ":2022",
			// I need a way to load this from an existing config?
			Data: home + "/data",
		}
		b, _ := json.Marshal(&sx.Options)
		os.WriteFile(home+"/config.json", b, 0644)
	}

	e = json.Unmarshal(b, &sx)
	if e != nil {
		panic(e.Error())
	}

	Start(&sx)
}
