package dgrtc

import (
	crand "crypto/rand"
	"encoding/binary"
	"math/big"

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

type KeyPair struct {
}

// browsers can only use 256; can we allow multiple keys like alg:key?
//	kp, e := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)

func NewKeyPair() (*KeyPair, error) {
	return &KeyPair{}, nil
}
