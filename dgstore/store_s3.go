package dgstore

import (
	"bytes"
	"context"
	"io/ioutil"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

type S3Client struct {
	Account
	Client *s3.Client
}

var _ Client = (*S3Client)(nil)

func (cl *S3Client) List(prefix string) (*s3.ListObjectsV2Output, error) {
	// Set up the parameters for listing objects
	listInput := &s3.ListObjectsV2Input{
		Bucket: aws.String(cl.BucketName),
		Prefix: aws.String(prefix),
	}

	// Perform the list operation
	resp, err := cl.Client.ListObjectsV2(context.TODO(), listInput)
	return resp, err
}
func (cl *S3Client) Put(filePath string, mimetype string, data []byte) error {

	// Perform the get operation
	_, err := cl.Client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket: aws.String(cl.BucketName),
		Key:    aws.String(filePath),
		Body:   bytes.NewReader(data),
	})
	return err
}
func (cl *S3Client) Get(filePath string) ([]byte, error) {
	getInput := &s3.GetObjectInput{
		Bucket: aws.String(cl.BucketName),
		Key:    aws.String(filePath),
	}

	// Perform the get operation
	resp, err := cl.Client.GetObject(context.TODO(), getInput)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	// Read the object contents
	return ioutil.ReadAll(resp.Body)
}

func (client *S3Client) Upload(path string, mime string, data []byte) error {
	uploadInput := &s3.PutObjectInput{
		Bucket:      aws.String(client.BucketName),
		Key:         aws.String(path), // This sets the object key to the same value as the file path
		Body:        bytes.NewReader(data),
		ContentType: aws.String(mime),
	}
	_, err := client.Client.PutObject(context.TODO(), uploadInput)
	return err
}

// Preauth implements Backend.
func (cl *S3Client) Preauth(filePath string) (string, error) {

	// Set up the parameters for generating the presigned URL
	presignInput := &s3.PutObjectInput{
		Bucket: aws.String(cl.BucketName),
		Key:    aws.String(filePath),
	}

	// Generate the presigned URL

	presignClient := s3.NewPresignClient(cl.Client)
	presignOutput, err := presignClient.PresignPutObject(
		context.TODO(),
		presignInput,
		func(opt *s3.PresignOptions) {
			opt.Expires = time.Duration(1 * time.Hour) // Set the expiration time for the presigned URL
		})
	if err != nil {
		return "", err
	}
	return presignOutput.URL, nil
}

func NewS3Client(a Account) (*S3Client, error) {

	r2Resolver := aws.EndpointResolverWithOptionsFunc(func(service, region string, options ...interface{}) (aws.Endpoint, error) {
		return aws.Endpoint{
			URL: a.Endpoint,
		}, nil
	})

	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithEndpointResolverWithOptions(r2Resolver),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(a.AccessKeyId, a.AccessKeySecret, "")),
	)
	if err != nil {
		return nil, err
	}

	client := s3.NewFromConfig(cfg)
	return &S3Client{
		Account: a,
		Client:  client,
	}, nil
}
