package dbhttplib

type ClientConfig struct {
	Url string
}

type Client struct {
}

type ClientTx struct {
	Key   [][]byte // key is database.table.columns
	Value [][]byte
	Op    []byte
}

func (cl *ClientTx) AddBytes(data []byte) {

}
func (cl *ClientTx) AddFile(path string) {

}
func (cl *ClientTx) Commit() error {

	return nil
}
func (cl *Client) Begin() *ClientTx {
	return nil
}

func NewClient() *Client {
	r := &Client{}
	return r
}
