package main

import (
	"encoding/json"
	"os"
	"testing"

	"github.com/invopop/jsonschema"
)

func Test_one(t *testing.T) {
	os.Args = []string{""}
	main()
}

func Test_generate(t *testing.T) {

	s := jsonschema.Reflect(&TestUser{})
	data, err := json.MarshalIndent(s, "", "  ")
	if err != nil {
		panic(err.Error())
	}
	os.WriteFile("schema/user.json", data, 0644)

}
