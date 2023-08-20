package main

import (
	"datagrove/dgcl"
	"fmt"
	"strings"
)

// a botutrl is bot@host
func ConnectBot(boturl string) (*dgcl.Session, error) {
	v := strings.Split(boturl, "@")
	if len(v) != 2 {
		return nil, fmt.Errorf("usage: dgc ssh target [dir]")
	}
	botname := v[0]
	host := v[1]
	cn, e := dgcl.Connect(host)
	if e != nil {
		return nil, e
	}
	bot, e := cn.Connect(botname)
	if e != nil {
		return nil, e
	}
	sess, e := bot.Session()
	return sess, e
}

func remote(url string, command string) {

}
