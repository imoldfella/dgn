package dglib

import (
	"encoding/json"
	"os"

	"github.com/tailscale/hujson"
)

func Unmarshal(b []byte, v interface{}) error {
	ast, err := hujson.Parse(b)
	if err != nil {
		return err
	}
	ast.Standardize()
	return json.Unmarshal(ast.Pack(), v)
}

func JsoncFile(v interface{}, path string) error {
	b, e := os.ReadFile(path)
	if e != nil {
		json, e := json.MarshalIndent(v, "", "  ")
		if e != nil {
			return e
		}
		return os.WriteFile(path, json, 0644)

	}
	return Unmarshal(b, v)

}
