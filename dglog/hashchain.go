package main

import (
	"datagrove/dgstore"
	"encoding/binary"
	"fmt"
	"hash/crc32"
	"math"
	"strconv"
	"strings"
)

// write partial records to prefix/tail
// when it fills up write it to prefix/{streamend}, and write a new prefix/tail (maybe empty).
// in the tail the last 8 bytes are the stream end.
const (
	LogBlockSize = 64 * 1024
	LogAll       = 1
	LogFirst     = 2
	LogMiddle    = 3
	LogLast      = 4
)

type HashChain struct {
	Prefix string
	Client dgstore.Client
	Data   []byte
	Len    int
	// StreamEnd counts down from MaxInt64 so that we can query in ascending order and find the last block.
	StreamEnd int64
}

func NewHashChain(prefix string, client dgstore.Client) *HashChain {
	r := &HashChain{
		Prefix: prefix,
		Client: client,
	}
	sl, e := client.List(prefix, 1)
	if e != nil {
		r.StreamEnd = math.MaxInt64
	} else {
		strings.Split(sl[0], "-")
		pn := sl[len(sl)-1]
		i, err := strconv.ParseInt(pn, 10, 64)
		if err != nil {
			r.StreamEnd = math.MaxInt64
		} else {
			r.StreamEnd = i
		}
	}

	b, e := client.Get(prefix + "tail")
	if e != nil {

	} else {
		r.Data = b
		r.Len = len(b)
	}
	return r
}

// when we flush, we can offer commit messages to the writer
// the hash of this is a pair (completed, sofar in next block)
// it doesn't seem needed for this public chain though, best effort seems ok.

func (t *HashChain) Flush() {
	// overwrite the tail block.
	key := t.Prefix + fmt.Sprintf("%016x", t.StreamEnd)
	t.Client.Put(key, "application/octet-stream", t.Data)
	t.Len = 0
}
func (t *HashChain) Append(id []byte, data []byte) {
	// write into tail blocks, one transaction my split across more than than one block. Hash chain the blocks.
	data = append(data, id...)
	need := len(data) + 7

	writeRecord := func(d []byte, ty byte) {
		csum := crc32.ChecksumIEEE(d)
		binary.LittleEndian.PutUint32(t.Data[t.Len:], csum)
		// we need to write a checksum
		// we need to write the length
		// we need to write the type
		// we need to write the data
		binary.LittleEndian.PutUint16(t.Data[t.Len+4:], uint16(len(data)))
		t.Data[t.Len+6] = ty
		copy(t.Data[t.Len+7:], data)
		t.Len += need
		if LogBlockSize-t.Len <= 7 {
			t.Flush()
		}
	}

	remain := LogBlockSize - t.Len
	if need < remain {
		writeRecord(data, LogAll)
		remain -= need
		// skip the remainder of the block

		return
	} else {
		// there's room for another record, but not all of it.
		partial := data[:remain-7]
		writeRecord(partial, LogFirst)
		t.Flush()
		for len(data) > len(t.Data)-7 {
			writeRecord(data, LogMiddle)
			t.Flush()
		}
		writeRecord(data, LogLast)

		data = data[remain-7:]

	}

}

/*
else if remain < 7 {
			// there's no room for another record,
			t.Flush()
			t.Len = 0
			t.StreamEnd--
		}
	// if tail doesn't exist yet, we may need to initialize it
	// if
	write := func(r Record) {

		p := r.Data

		t = app.pool.Get().(HashChain)
		m[str] = t
		// read the existing tail pointer, then tail
		fn := hex.EncodeToString(r.Dbid)
		b, e := app.Client.Get(fn)
		if e != nil {
			t.StreamEnd = 0
		} else {
			t.StreamEnd = int64(binary.LittleEndian.Uint64(b))
		}
		// read the tail block (if it exists)
		tb := str + "-" + fmt.Sprintf("%016x", t.StreamEnd)
		b, e = app.Client.Get(tb)
		if e != nil {
			t.Data = nil
			t.Len = 0
		} else {
			t.Data = b
			t.Len = len(b)
		}

	}
*/
