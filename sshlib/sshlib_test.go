package sshlib

import (
	"encoding/json"
	"os"
	"testing"
	"time"

	"github.com/invopop/jsonschema"
)

func Test_main(t *testing.T) {
	os.Args = []string{""}

	var home string
	if len(os.Args) > 1 {
		home = os.Args[1]
	} else {
		home, _ = os.Getwd()
	}

	// each task corresponds to a json file in the task directory.
	compilerMap := map[string]func(arg []byte) (Task, error){
		"user": func(config []byte) (Task, error) {
			var tu TestUser
			e := json.Unmarshal(config, &tu)
			if e != nil {
				return nil, e
			}
			return func(arg []byte) string {
				return string(config)
			}, nil
		},
	}

	sx := &Config{
		Banner:      "Sshlib test",
		Sftp:        ":2022",
		CompilerMap: compilerMap,
		Home:        home,
	}
	Start(sx)
}

func Test_generate(t *testing.T) {
	s := jsonschema.Reflect(&TestUser{})
	data, err := json.MarshalIndent(s, "", "  ")
	if err != nil {
		panic(err.Error())
	}
	os.WriteFile("schema/user.json", data, 0644)
}

type TestUser struct {
	Scheme      string                 `json:"$scheme,omitempty"`
	Run         []RunTask              `json:"run,omitempty"`
	ID          int                    `json:"id"`
	Name        string                 `json:"name" jsonschema:"title=the name,description=The name of a friend,example=joe,example=lucy,default=alex"`
	Friends     []int                  `json:"friends,omitempty" jsonschema_description:"The list of IDs, omitted when empty"`
	Tags        map[string]interface{} `json:"tags,omitempty" jsonschema_extras:"a=b,foo=bar,foo=bar1"`
	BirthDate   time.Time              `json:"birth_date,omitempty" jsonschema:"oneof_required=date"`
	YearOfBirth string                 `json:"year_of_birth,omitempty" jsonschema:"oneof_required=year"`
	Metadata    interface{}            `json:"metadata,omitempty" jsonschema:"oneof_type=string;array"`
	FavColor    string                 `json:"fav_color,omitempty" jsonschema:"enum=red,enum=green,enum=blue"`
}
