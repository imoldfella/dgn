package dbhttplib

type BlobStore interface {
	Add(path string, data []byte) error
	AddFile(path string) error
}
