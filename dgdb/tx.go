package dgdb

// an author is like a twitter user, issuer is like twitter vs bluesky

// data in this case is only the ke
type UpdateDatabase struct {
	DbId     uint32
	SchemaId uint32
	//Version uint32
	HMAC  [16]byte
	Table []TableOp
}
type TableOp struct {
	TableId uint32
	Op      []Op
}
type Op struct {
	// ops are defined in the schema. they can be webassembly routines.
	Op   uint32 // 0 = insert, 1 = delete, 2 = update, 3+ = custom
	Args []byte
}
type Committer interface {
	Commit() error
}

// only transactional locally; there is no way to enforce atomicity across different Schemas.
type Tx struct {
	*LocalServer
	Database []UpdateDatabase
}

func (tx *Tx) Commit() error {
	return nil
}
func (tx *Tx) Close() error {
	return nil
}
