package dgcash

package main

import (
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/sha256"
	"fmt"
	"math/big"
)

// author: Oleg Andreev
// Blind signatures for Bitcoin transactions
// Second draft
// http://oleganza.com/blind-ecdsa-draft-v2.pdf
func main() {
	type Alice struct {
		// message
		m *big.Int
		// Let a, b, c and d be unique random numbers within [1, n – 1] chosen by Alice.
		a, b, c, d *big.Int
	}

	type Bob struct {
		// Let p and q be unique random numbers within [1, n – 1] chosen by Bob.
		p, q *big.Int
	}

	// curve
	E := elliptic.P256()
	// params
	params := E.Params()
	n := params.N

	alice, bob := Alice{m: big.NewInt(7)}, Bob{}
	// 1. Alice chooses random numbers a, b, c, d within [1, n – 1].
	alice.a, alice.b, alice.c, alice.d = big.NewInt(11), big.NewInt(13), big.NewInt(17), big.NewInt(19)
	// help vars for calcs
	tmp, x, y := new(big.Int), new(big.Int), new(big.Int)
	// 2. Bob chooses random numbers p, q within [1, n – 1]
	// and sends two EC points to Alice: P = (p -1 ·G) and Q = (q·p -1 ·G).
	bob.p, bob.q = big.NewInt(23), big.NewInt(29)
	Px, Py := E.ScalarBaseMult(new(big.Int).ModInverse(bob.p, n).Bytes())
	Qx, Qy := E.ScalarBaseMult(new(big.Int).Mul(bob.q, new(big.Int).ModInverse(bob.p, n)).Bytes())
	// 3. Alice computes K = (c·a) -1 ·P and public key T = (a·Kx) -1 ·(b·G + Q + d·c -1 ·P).
	tmp = new(big.Int)
	Kx, Ky := E.ScalarMult(Px, Py, tmp.Mul(alice.c, alice.a).ModInverse(tmp, n).Bytes())

	Tx, Ty := E.ScalarBaseMult(alice.b.Bytes())
	Tx, Ty = E.Add(Tx, Ty, Qx, Qy)
	x, y = E.ScalarMult(Px, Py, new(big.Int).Mul(alice.d, new(big.Int).ModInverse(alice.c, n)).Bytes())
	Tx, Ty = E.Add(Tx, Ty, x, y)
	tmp = new(big.Int)
	Tx, Ty = E.ScalarMult(Tx, Ty, tmp.Mul(alice.a, Kx).ModInverse(tmp, n).Bytes())

	// 4. When time comes to sign a message (e.g. redeeming funds locked in a Bitcoin transaction),
	// Alice computes the hash h of her message.
	h := hashToInt(hash(alice.m.Bytes()), E)
	// 5. Alice blinds the hash and sends h 2 = a·h + b (mod n) to Bob.
	tmp = new(big.Int)
	h2 := tmp.Mul(alice.a, h).Add(tmp, alice.b).Mod(tmp, n)
	// 6. Bob verifies the identity of Alice via separate communications channel.
	// 7. Bob signs the blinded hash and returns the signature to Alice: s 1 = p·h 2 + q (mod n).
	tmp = new(big.Int)
	s1 := tmp.Mul(bob.p, h2).Add(tmp, bob.q).Mod(tmp, n)
	// 8. Alice unblinds the signature: s 2 = c·s 1 + d (mod n).
	tmp = new(big.Int)
	s2 := tmp.Mul(alice.c, s1).Add(tmp, alice.d).Mod(tmp, n)
	// 9. Now Alice has (Kx, s 2 ) which is a valid ECDSA signature of hash h verifiable by public key T.
	// If she uses it in a Bitcoin transaction, she will be able to redeem her locked funds without Bob
	// knowing which transaction he just helped to sign.

	// verify with standar ecdsa package
	fmt.Println(ecdsa.Verify(&ecdsa.PublicKey{Curve: E, X: Tx, Y: Ty}, h.Bytes(), Kx, s2))
	_ = Ky
}

func hash(msg []byte) []byte {
	hasher := sha256.New()
	hasher.Write(msg)
	return hasher.Sum(nil)
}

// from http://golang.org/src/pkg/crypto/ecdsa/ecdsa.go

// hashToInt converts a hash value to an integer. There is some disagreement
// about how this is done. [NSA] suggests that this is done in the obvious
// manner, but [SECG] truncates the hash to the bit-length of the curve order
// first. We follow [SECG] because that's what OpenSSL does. Additionally,
// OpenSSL right shifts excess bits from the number if the hash is too large
// and we mirror that too.
func hashToInt(hash []byte, c elliptic.Curve) *big.Int {
	orderBits := c.Params().N.BitLen()
	orderBytes := (orderBits + 7) / 8
	if len(hash) > orderBytes {
		hash = hash[:orderBytes]
	}

	ret := new(big.Int).SetBytes(hash)
	excess := len(hash)*8 - orderBits
	if excess > 0 {
		ret.Rsh(ret, uint(excess))
	}
	return ret
}
