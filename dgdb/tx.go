package dgdb

// an author is like a twitter user, issuer is like twitter vs bluesky

// page hea
type PageHeader struct {
	DbId          uint32 //
	SchemaId      uint32 // each grove issues unique tree ids.
	SchemaVersion uint32 // version is used to regress the key to decrypt
	TableId       uint32 // each grove issues unique tree ids.
}

// data in this case is only the ke
type UpdateDatabase struct {
	DbId     uint32
	SchemaId uint32
	//Version uint32
	HMAC  [16]byte
	Table []TableOp
}
type TableOp struct {
	Table uint32
	Op    []Op
}
type Op struct {
	Op   uint32 // 0 = insert, 1 = delete, 2 = update, 3+ = custom
	Args []byte
}

// a tx is logically a +/- tuple, but for compression we can also add an update that is a delta from a previous value.
// only transactional locally; there is not way to enforce atomicity across different trees.
type Tx struct {
	Database []UpdateDatabase
}
