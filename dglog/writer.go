package main

import (
	"encoding/binary"
	"encoding/hex"
	"time"
)

type Tail struct {
	Data []byte
	Len  int
	// we need to look this up, cache in memory.
	StreamEnd int64
}

const (
	LogBlockSize = 64 * 1024
	LogAll       = 1
	LogFirst     = 2
	LogMiddle    = 3
	LogLast      = 4
)

func writeChecksum(d []byte, out []byte) {
	// we need to write a checksum
	// we need to write the length
	// we need to write the type
	// we need to write the data
}

func writer() {
	m := map[string]Tail{}

	flush := func(t Tail) {
		// we can write this async, but we only want to commit to the writer when all previous writes are committed.
		app.Client.Put("", "application/octet-stream", t.Data)
	}

	advance := func(t Tail) {

	}

	// if tail doesn't exist yet, we may need to initialize it
	// if
	write := func(r Record) {
		t, ok := m[string(r.Dbid)]
		p := r.Data
		if !ok {
			t = app.pool.Get().(Tail)
			m[string(r.Dbid)] = t
			// read the existing tail pointer, then tail
			fn := hex.EncodeToString(r.Dbid)
			b, e := app.Client.Get(fn)
			if e != nil {
				t.StreamEnd = 0
			} else {
				t.StreamEnd = int64(binary.LittleEndian.Uint64(b))
			}
		}

		// break into blocks
		for {
			remain := LogBlockSize - t.Len
			if remain < 8 {

				t.Len = 0
				continue
			}
			if len(p)+7 < remain {
				writeChecksum(p, t.Data[t.Len:])
				binary.LittleEndian.PutUint16(t.Data[t.Len+4:], uint16(len(p)))
				t.Data[t.Len+6] = LogAll
				copy(t.Data[t.Len+7:], p)
				t.Len += len(p) + 7
				return
			} else if remain < 7 {

			}
			t.Data = append(t.Data, p...)
			t.Len += len(p)
			if t.Len > LogBlockSize {

				t.Data = nil
				t.Len = 0
			}
		}

	}
	ticker := time.NewTicker(10 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case r := <-app.Write:
			write(r)
		case <-ticker.C:
			// flush all the tails
			for _, t := range m {
				flush(t)
			}
			// if we have too many streams open we should delete least recently used (or random 2nd chance would be ok too)
		}

	}
}
