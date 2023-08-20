package dgdb

type IoRing interface {
	Submit(r Request) error
}

type Memory interface {
	Pin(sz uint64) ([]byte, error)
	Unpin([]byte) error
}

// 64 bytes
type Request struct {
	Complete func(r *Request)
}
