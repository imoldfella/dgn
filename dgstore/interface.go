package dgstore

import (
	"bytes"
	"fmt"
	"io"
	"log"
	"net/http"
)

type Client interface {
	Put(key string, mimetype string, value []byte) error
	Get(key string) ([]byte, error)
	Preauth(key string) (string, error)
}

type Account struct {
	Driver                                                        string
	AccountId, AccessKeyId, AccessKeySecret, BucketName, Endpoint string
	UseHttp                                                       bool
}

func NewClient(a *Account) (Client, error) {
	switch a.Driver {
	case "s3":
		return NewS3Client(*a)
	case "minio":
		return NewMinioClient(a)
	}
	return nil, fmt.Errorf("unknown driver %s", a.Driver)
}
func Upload(url string, mime string, data []byte) error {

	req, err := http.NewRequest("PUT", url, bytes.NewReader(data))
	if err != nil {
		log.Fatal(err)
	}
	req.Header.Set("Content-Type", mime)

	client := &http.Client{}
	res, err := client.Do(req)
	if err != nil {
		log.Fatal(err)
	}
	defer res.Body.Close()

	b, e2 := io.ReadAll(res.Body)
	if e2 != nil {
		return e2
	}
	log.Print(string(b))
	return e2
}
