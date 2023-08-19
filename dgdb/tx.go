package dgdb

// an author is like a twitter user, issuer is like twitter vs bluesky
type TupleHeader struct {
	Grove   uint32   //
	Tree    uint32   // each grove issues unique tree ids.
	Version uint32   // version is used to regress the key to decrypt
	HMAC    [16]byte // hmac created with writer key

}

type Auth struct {
	Grove   uint32
	Tree    uint32
	Version uint32
	HMAC    [16]byte
}

// a tx is logically a +/- tuple, but for compression we can also add an update that is a delta from a previous value.
type Tx struct {
	Auth   []Auth
	Delete []Delete
	Insert []Insert
	Update []Update
}

type Delete struct {
	// the slice to delete from
}
