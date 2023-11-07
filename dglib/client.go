package dglib

// wrap access to dglog. We need a way to keep proofs of db access.
type DbConfig struct {
	Token   string `json:"token,omitempty"`
	Refresh string `json:"refresh,omitempty"`
}
type LogServerConfig struct {
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

func NewClient(dir string) (*Client, error) {
	cl := Client{
		Dir: dir,
	}
	JsoncFile(cl.ClientConfig, dir, "config.jsonc")
	return &cl, nil
}
