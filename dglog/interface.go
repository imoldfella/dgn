package main

type Grant struct {
	Db int64
}

// a proof is a chain of grants
type Proof struct {
	Grant []Grant
}

type DbLogin struct {
	Db    int64
	Proof []Proof
}

type Login struct {
	Db []DbLogin
}
type LoginResponse struct {
	Token []string
}

// this allows a write to a db
type TokenPayload struct {
	Db int64
}
