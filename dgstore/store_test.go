package dgstore

import (
	"os"
	"testing"

	"github.com/joho/godotenv"
)

func Test_r2(t *testing.T) {
	godotenv.Load()
	a := Account{
		Endpoint:        os.Getenv("endpoint"), //  fmt.Sprintf("https://%s.r2.cloudflarestorage.com", a.AccountId)
		AccountId:       os.Getenv("id"),
		AccessKeyId:     os.Getenv("access_key"),
		AccessKeySecret: os.Getenv("secret_key"),
		BucketName:      os.Getenv("bucket"),
	}
	cl, e := NewS3Client(a)
	if e != nil {
		t.Fatal(e)
	}
	e = cl.Upload("test.txt", "text/plain", []byte("hello world"))
	if e != nil {
		t.Fatal(e)
	}
}
func Test_minio(t *testing.T) {
	godotenv.Load()
	a := Account{
		Driver:          os.Getenv("driver"),
		Endpoint:        os.Getenv("endpoint"), //  fmt.Sprintf("https://%s.r2.cloudflarestorage.com", a.AccountId)
		AccountId:       os.Getenv("id"),
		AccessKeyId:     os.Getenv("access_key"),
		AccessKeySecret: os.Getenv("secret_key"),
		BucketName:      os.Getenv("bucket"),
		UseHttp:         true,
	}
	cl, e := NewClient(&a)
	if e != nil {
		t.Fatal(e)
	}
	e = cl.Put("test.txt", "text/plain", []byte("hello world"))
	if e != nil {
		t.Fatal(e)
	}
	b, e := cl.Get("test.txt")
	if e != nil {
		t.Fatal(e)
	}
	if string(b) != "hello world" {
		t.Fatal("bad get")
	}

	p, e := cl.Preauth("test2.txt")
	if e != nil {
		t.Fatal(e)
	}
	e = Upload(p, "text/plain", []byte("hello world"))
	if e != nil {
		t.Fatal(e)
	}
	b, e = cl.Get("test2.txt")
	if e != nil {
		t.Fatal(e)
	}
	if string(b) != "hello world" {
		t.Fatal("bad get")
	}
	t.Log(p)
}
