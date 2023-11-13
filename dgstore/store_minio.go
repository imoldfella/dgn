package dgstore

import (
	"bytes"
	"context"
	"io"
	"time"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

type MinioClient struct {
	Account
	Client *minio.Client
}

// List implements Client.
func (cl *MinioClient) List(prefix string, limit int) ([]string, error) {
	// Set up the parameters for listing objects
	// listInput := cl.Client.ListObjects{
	// 	Bucket: aws.String(cl.BucketName),
	// 	Prefix: aws.String(prefix),
	// }

	// Perform the list operation
	rg := cl.Client.ListObjects(context.TODO(), prefix, minio.ListObjectsOptions{
		UseV1:  true,
		Prefix: prefix,
		//Recursive: true,
	})

	var r []string
	for o := range rg {
		r = append(r, o.Key)
	}
	return r, nil
}

func NewMinioClient(a *Account) (*MinioClient, error) {

	minioClient, err := minio.New(a.Endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(a.AccessKeyId, a.AccessKeySecret, ""),
		Secure: !a.UseHttp,
	})
	if err != nil {
		return nil, err
	}
	return &MinioClient{
		Account: *a,
		Client:  minioClient,
	}, nil
}

// Get implements Backend.
func (cl *MinioClient) Get(key string) ([]byte, error) {
	b, err := cl.Client.GetObject(context.TODO(), cl.BucketName, key, minio.GetObjectOptions{})
	if err != nil {
		return nil, err
	}
	defer b.Close()
	return io.ReadAll(b)
}

// Preauth implements Backend.
func (cl *MinioClient) Preauth(key string) (string, error) {
	b, err := cl.Client.PresignedPutObject(context.TODO(), cl.BucketName, key, time.Second*24*60*60)
	return b.String(), err
}

// Put implements Backend.
func (cl *MinioClient) Put(key string, mimetype string, value []byte) error {
	// Perform the get operation
	_, err := cl.Client.PutObject(context.TODO(), cl.BucketName, key, bytes.NewReader(value), int64(len(value)), minio.PutObjectOptions{})
	return err
}

var _ Client = (*MinioClient)(nil)
