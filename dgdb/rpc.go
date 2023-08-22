package dgdb

import (
	"encoding/json"

	"github.com/fxamacker/cbor"
	"github.com/go-webauthn/webauthn/webauthn"
)

type Session struct {
	//Stdout io.Writer
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
	PasskeyConfig *webauthn.Config `json:"passkey_config,omitempty"`
}
type Rpcpj struct {
	Rpcj
	*Session
}

func (s *Api) AddApi(name string, auth bool, f func(r *Rpcp) (any, error)) {
}
func (s *Api) AddApij(name string, auth bool, f func(r *Rpcpj) (any, error)) {
}
