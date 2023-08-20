package dgdb

// page hea
type PageHeader struct {
	DbId          uint32 //
	SchemaId      uint32 // each grove issues unique tree ids.
	SchemaVersion uint32 // version is used to regress the key to decrypt
	TableId       uint32 // each grove issues unique tree ids.
}

type TreeKeeper struct {
}
