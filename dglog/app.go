package main

import (
	"bytes"
	"datagrove/dgcap"
	"datagrove/dglib"
	"datagrove/dgstore"
	"fmt"
	"hash/fnv"
	"io"
	"log"
	"net/http"
	"path"
	"sync"

	"crypto/sha256"

	"encoding/binary"

	"math"
	"strconv"
	"strings"

	"github.com/fxamacker/cbor/v2"
)

const (
	Writers = 100
)

//var serverSecret = []byte("serverSecret")

// we can presign blobs, log entries.
// return tokens for repeat operations
// generally blobs should be written first, then log entries.
// we don't need refresh tokens, instead use the age of the proof to indicate if revokes need to be checked.

// what advantage is there to running the logger over https?
// we don't trust the logger anyway?
type ConfigHttps struct {
	Port string `json:"port,omitempty"`
	Http bool   `json:"http,omitempty"`
}
type Config struct {
	Account dgstore.Account `json:"account,omitempty"` // s3, local
	Https   []ConfigHttps   `json:"https,omitempty"`   // s3 bucket or local directory
}
type App struct {
	Dir string
	Config
	Client dgstore.Client
	*dgcap.CapDb
	Write []chan dglib.LogOp

	pool sync.Pool
}

var app App

func startup(dir string) error {
	writer := func(n int) error {
		ch := app.Write[n]
		hc, e := NewHashChain(fmt.Sprintf("public/%d/", n), app.Client)
		if e != nil {
			return e
		}
		// flush writes the tail even if it is not full. It does not advance the tail pointer
		//ticker := time.NewTicker(3 * time.Second)
		//defer ticker.Stop()
		for r := range ch {
			// empty the channel
			rv := []dglib.LogOp{r}
			for len(ch) > 0 {
				rv = append(rv, <-ch)
			}
			hc.Append(rv)

			// case <-ticker.C:
			// 	hc.Flush()
		}
		return nil
	}

	// read configuration for the directory
	app.Config = Config{
		Account: dgstore.Account{
			Driver:          "",
			AccountId:       "",
			AccessKeyId:     "",
			AccessKeySecret: "",
			BucketName:      "",
			Endpoint:        "",
			UseHttp:         false,
		},
		Https: []ConfigHttps{{
			Port: ":3000",
			Http: true,
		}},
	}
	dglib.JsoncFile(&app.Config, path.Join(dir, "config.jsonc"))
	cl, err := dgstore.NewClient(&app.Account)
	if err != nil {
		return err
	}
	app.Client = cl
	app.pool.New = func() interface{} {
		return new(HashChain)
	}
	app.CapDb, err = dgcap.NewCapDb(dir)
	if err != nil {
		return err
	}

	app.Write = make([]chan dglib.LogOp, Writers)
	for i := 0; i < Writers; i++ {
		app.Write[i] = make(chan dglib.LogOp, 1000)
		go writer(i)
	}

	http.HandleFunc("/", func(res http.ResponseWriter, req *http.Request) {
		res.Write([]byte("dbhttp"))
	})

	commit := func(res http.ResponseWriter, req *http.Request) {
		// req.Header.Get("Authorization")
		var buf bytes.Buffer
		_, e := io.Copy(&buf, req.Body)
		if e != nil {
			return
		}
		b, e := Commit(buf.Bytes())
		if e != nil {
			res.Write(b)
		}
	}
	http.HandleFunc("/commit", commit)
	log.Printf("listening on %s", app.Config.Https[0].Port)
	return http.ListenAndServe(app.Config.Https[0].Port, nil)
}

// hash a binary array, use hash to pick deterministically from a set of n

func hashPick(n int, b []byte) int {
	h := fnv.New32a()
	h.Write(b)
	return int(h.Sum32()) % n
}

// type Proof struct {
// 	Time    int64 // must be in the last 10 seconds
// 	Db      []dgcap.Proof
// 	Presign []bool
// }

// a refresh token can potentially be larger since it is not sent repeatedly? Although we can store in our database the serial number of the token and check with a single lookup if
type CommitResponse struct {
	// if given a proof return a refresh token +
	Token  [][]byte // this is always a refreshable token
	Result []dglib.Result
}

func Commit(data []byte) ([]byte, error) {
	// this
	var op dglib.CommitOp
	cbor.Unmarshal(data, &op)

	// validate the proof or token, create tokens for proofs. refresh old tokens.
	var rtoken [][]byte
	var result []dglib.Result
	for _, p := range op.Proof {
		var tok []byte
		switch p.Type {
		case dglib.ProofType:
			var proof dgcap.Proof
			cbor.Unmarshal(p.Data, &proof)
			tok, rev, e := app.CapDb.ProofToken(&proof, 0)
			// a, e := dgcap.ProofToken(&dbo, serverSecret, login.Time)
			// if e == nil {
			// 	r.Token = append(r.Token, a)
			// }

		case dglib.ProofTokenType:
			// if the token is too old, check for revokes and return a new token.

		}
		rtoken = append(rtoken, tok)
	}
	// dbid, e := dgcap.CanWrite([]byte(auth), serverSecret)
	// if e != nil {
	// 	return
	// }

	// what guarantee if the operation succeeds? What timeout do we allow for storage?
	var wg sync.WaitGroup
	wg.Add(len(op.Log))
	for _, l := range op.Log {
		switch l.Type {
		case dglib.OpBlob:
			p, e := app.Client.Preauth(fmt.Sprintf("%x", l.Db))
			if e != nil {
				result = append(result, dglib.Result{
					Error: e.Error(),
				})
				continue
			} else {
				result = append(result, dglib.Result{
					Value: []byte(p),
				})
			}
			wg.Done()
		case dglib.OpLogEntry:
			app.Write[l.Db%Writers] <- l
		}
	}
	// wait for all writes to complete (or fail or timeout)
	wg.Wait()

	// return tokens if the request sent proofs, this speeds up subsequent writes.
	b, e := cbor.Marshal(&CommitResponse{
		Token:  rtoken,
		Result: result,
	})
	if e != nil {
		return nil, e
	}
	return b, nil
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
func (hc *HashChain) Append(data []dglib.LogOp) error {
	var b bytes.Buffer
	buf := make([]byte, binary.MaxVarintLen64)
	add := func(x uint64) {
		n := binary.PutUvarint(buf, x)
		b.Write(buf[:n])
	}

	// add all the data last; this allows us to stream without creating a contiguous buffer for the data.
	for _, r := range data {
		add(uint64(r.Dbid))
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
