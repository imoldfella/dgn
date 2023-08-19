package dgdb

// an author is like a twitter user, issuer is like twitter vs bluesky
type PageHeader struct {
	Issuer  uint32
	Author  uint32
	Version uint32
	HMAC    [16]byte // hmac created with writer key.
}
