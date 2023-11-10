package dglib

import (
	"bytes"
	"datagrove/dgcap"
	"fmt"
	"io"
	"net/http"

	"github.com/fxamacker/cbor/v2"
)

// for each database we write to, we must provide a proof that this device has access to that database. The proof is a chain of signatures rooted in the keypair that defines the database

type Grant struct {
	Db int64
}

type LoginOp struct {
	Time int64 // must be in the last 10 seconds
	Db   []dgcap.Proof
}
type LoginResponse struct {
	Token [][]byte
}

// this allows a write to a db
type TokenPayload struct {
	Db int64
}

// wrap access to dglog. We need a way to keep proofs of db access.
type DbConfig struct {
	Token   string `json:"token,omitempty"`
	Refresh string `json:"refresh,omitempty"`
}
type LogServerConfig struct {
	Id  dgcap.Keypair
	Url string `json:"url,omitempty"`
	Db  map[int64]*DbConfig
}
type ClientConfig struct {
	Server map[string]LogServerConfig
}

type Client struct {
	ClientConfig
	Dir string
}

type FutureBlob struct {
	Type int
	Data []byte
}
type ClientTx struct {
	Blob   []FutureBlob
	Params []any
	Op     []string
}

type Blob int // sha hash

// slightly awkward but avoids having to pick through cbor objects.
func (cl *ClientTx) BlobBytes(data []byte) Blob {
	cl.Blob = append(cl.Blob, FutureBlob{Type: 0, Data: data})
	return Blob(len(cl.Blob) - 1)
}
func (cl *ClientTx) BlobFile(path string) Blob {
	cl.Blob = append(cl.Blob, FutureBlob{Type: 1, Data: []byte(path)})
	return Blob(len(cl.Blob) - 1)
}

// return a handle to a result that is resolved after commit.
func (cl *ClientTx) Exec(op string, params any, out any) {
	cl.Op = append(cl.Op, op)
	cl.Params = append(cl.Params, params)
}
func (cl *ClientTx) Commit() error {
	// we need to convert the tx to a cbor object. We need to upload the blobs first before committing the transaction. Can we pick them out of a cbor object? Do we need Go reflection?
	// cbor does not have a type for blobs.
	return nil
}

// note that a db must indicate the server and the database
// server/db
func (cl *Client) Begin(db string) (*ClientTx, error) {
	return nil, nil
}

type RpcOp struct {
	Token  []byte
	Db     []byte
	Op     string
	Params any
}

func (cl *Client) Rpc(server string, database []byte, op string, params any, out any) error {

	svr, ok := cl.Server[server]
	if !ok {
		return fmt.Errorf("no server %s", server)
	}

	b, e := cbor.Marshal(&RpcOp{
		Db:     database,
		Op:     op,
		Params: params,
	})
	if e != nil {
		return e
	}

	resp, e := http.Post(svr.Url+"/rpc", "application/cbor", bytes.NewReader(b))
	if e != nil {
		return e
	}
	defer resp.Body.Close()
	b, e = io.ReadAll(resp.Body)
	if e != nil {
		return e
	}
	return cbor.Unmarshal(b, out)
}

// this will create server/account/db
// it will also create a record in the account db, so requires a token for that db.
func (cl *Client) CreateDb(db string) error {
	return nil
}

func NewClient(dir string) (*Client, error) {
	cl := Client{
		Dir: dir,
	}
	JsoncFile(cl.ClientConfig, dir, "config.jsonc")
	return &cl, nil
}
