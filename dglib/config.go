package dglib

import (
	"encoding/json"
	"os"
	"path"

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

func JsoncFile(v interface{}, p ...string) error {
	b, e := os.ReadFile(path.Join(p...))
	if e != nil {
		return e
	}
	return Unmarshal(b, v)

}
