package dgdb

import (
	"encoding/json"
	"io"

	"github.com/fxamacker/cbor"
)

type Session struct {
	Stdout io.Writer
	Secret []byte
	Data   map[string]interface{}
}

type Rpcj struct {
	Method string          `json:"method"`
	Params json.RawMessage `json:"params"`
	Id     int64           `json:"id"`
}
type Rpc struct {
	Method string          `json:"method"`
	Params cbor.RawMessage `json:"params"`
	Id     int64           `json:"id"`
}
type Rpcp struct {
	Rpc
	*Session
}
type Api struct {
	Fn  map[string]func(r *Rpcp) (any, error)
	Fnj map[string]func(r *Rpcpj) (any, error)
}
type Rpcpj struct {
	Rpcj
	*Session
}

func (s *Api) AddApi(name string, auth bool, f func(r *Rpcp) (any, error)) {
	s.Fn[name] = f
}
func (s *Api) AddApij(name string, auth bool, f func(r *Rpcpj) (any, error)) {
	s.Fnj[name] = f
}
