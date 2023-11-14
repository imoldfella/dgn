package main

import (
	"bytes"
	"crypto/sha256"
	"datagrove/dgstore"
	"encoding/binary"
	"fmt"
	"io"
	"math"
	"strconv"
	"strings"
)

type Record struct {
	Dbid     uint64
	Clientid uint64
	Data     []byte
}

type HashChain struct {
	Prefix string
	Client dgstore.Client
	Data   []byte
	Len    int
	// StreamEnd counts down from MaxInt64 so that we can query in ascending order and find the last block.
	StreamEnd int64
	Hash      [32]byte
}

// what is the compressibility of Dbid? should we use integer and bind it into the token? this requires a database lookup or potentially build the integer into the certificate chain? that only requires a lookup when the database is created.

// each block should begin with a format byte, then 32 byte hash, then an array of records.
func (hc *HashChain) Append(data []Record) error {
	var b bytes.Buffer
	buf := make([]byte, binary.MaxVarintLen64)
	add := func(x uint64) {
		n := binary.PutUvarint(buf, x)
		b.Write(buf[:n])
	}

	// add all the data last; this allows us to stream without creating a contiguous buffer for the data.
	for _, r := range data {
		add(r.Dbid)
		add(r.Clientid)
		add(uint64(len(r.Data)))
	}
	// compute the hash
	h := sha256.New()
	h.Write(hc.Hash[:])
	io.Copy(h, &b)
	for _, r := range data {
		h.Write(r.Data)
	}
	key := fmt.Sprintf("%s%016x", hc.Prefix, hc.StreamEnd)
	// create a reader buffer
	hc.StreamEnd--

	reader := io.MultiReader()
	hc.Client.PutReader(key, "application/octet-stream", reader)
	return nil
}
func NewHashChain(prefix string, client dgstore.Client) (*HashChain, error) {
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
			r.StreamEnd = i - 1
			// we need to read the last block to get the hash
			key := fmt.Sprintf("%s%016x", prefix, r.StreamEnd)
			data, err := client.GetSome(key, 0, 32)
			if err != nil {
				return nil, err
			}
			copy(r.Hash[:], data)
		}
	}

	return r, nil
}
