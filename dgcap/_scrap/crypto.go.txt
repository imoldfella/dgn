package dgcap

import (
	crand "crypto/rand"
	"encoding/binary"
	"math/big"
	"strings"

	"github.com/pion/randutil"
)

// GenerateCryptoRandomString generates a random string for cryptographic usage.
func GenerateCryptoRandomString(n int, runes string) (string, error) {
	letters := []rune(runes)
	b := make([]rune, n)
	for i := range b {
		v, err := crand.Int(crand.Reader, big.NewInt(int64(len(letters))))
		if err != nil {
			return "", err
		}
		b[i] = letters[v.Int64()]
	}
	return string(b), nil
}

// CryptoUint64 returns cryptographic random uint64.
func CryptoUint64() (uint64, error) {
	var v uint64
	if err := binary.Read(crand.Reader, binary.LittleEndian, &v); err != nil {
		return 0, err
	}
	return v, nil
}

func RandSeq(n int) string {
	val, err := randutil.GenerateCryptoRandomString(n, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")
	if err != nil {
		panic(err)
	}

	return val
}

type Identity struct {
	Name string
}

func (id *Identity) Host() string {
	v := strings.Split(id.Name, "@")
	return v[1]
}

type IdentityDatabase interface {
	Get(name string) (*Identity, error)
}

// browsers can only use 256; can we allow multiple keys like alg:key?
//	kp, e := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)

// this probably needs to take an identity database as well?
func NewIdentity(name string) (*Identity, error) {
	return &Identity{}, nil
}

type SimpleIdentityDatabase struct {
}

// Get implements IdentityDatabase.
func (*SimpleIdentityDatabase) Get(channel string) (*Identity, error) {
	return &Identity{}, nil
}
func NewSimpleIdentityDatabase() *SimpleIdentityDatabase {
	return &SimpleIdentityDatabase{}
}

var _ IdentityDatabase = (*SimpleIdentityDatabase)(nil)
