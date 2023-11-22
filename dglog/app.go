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

	"github.com/fxamacker/cbor/v2"
)

var serverSecret = []byte("serverSecret")

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

const (
	Writers = 100
)

type App struct {
	Dir string
	Config
	Client dgstore.Client
	Write  []chan Record

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
			rv := []Record{r}
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
	app.Write = make([]chan Record, Writers)
	for i := 0; i < Writers; i++ {
		app.Write[i] = make(chan Record, 1000)
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

type Proof struct {
	Time    int64 // must be in the last 10 seconds
	Db      []dgcap.Proof
	Presign []bool
}

// we can presign blobs, log entries.
// return tokens for repeat operations
// generally blobs should be written first, then log entries.
// we don't need refresh tokens, instead use the age of the proof to indicate if revokes need to be checked.
const (
	ProofType = iota
	ProofTokenType

	OpBlob = iota
	OpLogEntry
)

type CommitOp struct {
	Proof []struct {
		Type int
		Data []byte // token or cbor proof
	}
	// operations are ordered only if they are for the same database.
	Log []struct {
		Proof int // index into proof array
		// note that the proof may cover multiple databases and schemas
		Type   int // blob or log entry
		Db     uint64
		Schema uint64
		Data   []byte
	}
}

type Result struct {
	Error string
	Value []byte
}

// a refresh token can potentially be larger since it is not sent repeatedly? Although we can store in our database the serial number of the token and check with a single lookup if
type CommitResponse struct {
	// if given a proof return a refresh token +
	Token  [][]byte // this is always a refreshable token
	Result []Result
}

func Commit(data []byte) ([]byte, error) {
	// this
	var op CommitOp
	cbor.Unmarshal(data, &op)

	// validate the proof or token, create tokens for proofs. refresh old tokens.
	var rtoken [][]byte
	var result []Result
	for _, p := range op.Proof {
		var tok []byte
		switch p.Type {
		case ProofType:

			a, e := dgcap.ProofToken(&dbo, serverSecret, login.Time)
			if e == nil {
				r.Token = append(r.Token, a)
			}

		case ProofTokenType:
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
		case OpBlob:
			p, e := app.Client.Preauth(fmt.Sprintf("%x", l.Db))
			if e != nil {
				result = append(result, Result{
					Error: e.Error(),
				})
				continue
			} else {
				result = append(result, Result{
					Value: []byte(p),
				})
			}
			wg.Done()
		case OpLogEntry:
			var r dglib.CommitResponse

			// there is a character in the dbid that indicates if this is public or private.
			// all public databases go in the same stream, all private databases go in unique streams.

			// validate the request.

			// we only try to serialize writes if they are in the same schema?

			app.Write[op.Db%Writers] <- Record{
				Dbid: dbid,
				Data: n,
			}
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
