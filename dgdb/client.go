package dgdb

import (
	"bytes"

	"encoding/base64"
	"encoding/json"
	"errors"
)

type LeaseApi interface {
	// There can only be one primary writer per schema. Other writers should delegate to the primary writer. They can outbid the primary writer to become writers themselves, the lease must expire though.
	LeaseSchema(desc SchemaRequest) (Writer, error)
	RequestFollow(follower FollowRequest) error
}
type SchemaRequest struct {
}
type FollowRequest struct {
}

// calls from datagrove back to the database
// this is wrapper around a webrtc offer?
type DatagroveCallback interface {
	RequestConnection(cn ConnectionRequest) error
}

// writers connect to be able to write, read only may get lower latency if they connect.
type ConnectionRequest struct {
}

// webrtc to accept followers from a datagrove cluster

// returns a writer to the schema. Writing is done by the database as a result of commiting transactions first to the local database, then replicating to the remote schema.
type Writer interface {
}

type Callback interface {
	RequestFollow(follower Author) error
}
type Author struct {
	Handle int
}

type BasicDatagrove struct {
}

func (d *BasicDatagrove) ClaimAuthor(did string) (Author, error) {
	return Author{}, nil
}

func NewServer(did string) (*LeaseApi, error) {
	return nil, nil
}

type DatagroveClient struct {
}

// ClaimAuthor implements Datagrove.
func (*DatagroveClient) LeaseSchema(did SchemaRequest) (Writer, error) {
	panic("unimplemented")
}

// RequestFollow implements Datagrove.
func (*DatagroveClient) RequestFollow(follower FollowRequest) error {
	panic("unimplemented")
}

var _ LeaseApi = &DatagroveClient{}

type BotConnection struct {
}

func (d *DatagroveClient) Connect(botname string) (*BotConnection, error) {
	return nil, nil
}
func (d *BotConnection) Session() (*Session, error) {
	return nil, nil
}

func Remote(url string, command string) {

}

// Decode decodes the input from base64
// It can optionally unzip the input after decoding
func Decode(in string, obj interface{}) {
	b, err := base64.StdEncoding.DecodeString(in)
	if err != nil {
		panic(err)
	}

	err = json.Unmarshal(b, obj)
	if err != nil {
		panic(err)
	}
}

// this is the dg client library that allows remote access to the dgdb
// without necessarily running a dgdb server locally

func SshProxy(target string) error {

	return nil
}

func (d *Session) Run(cmd string) error {
	return nil
}

func (s *Session) Output(cmd string) ([]byte, error) {
	if s.Stdout != nil {
		return nil, errors.New("ssh: Stdout already set")
	}
	var b bytes.Buffer
	s.Stdout = &b
	err := s.Run(cmd)
	return b.Bytes(), err
}

/*
	// !!bug
	// we should get the offer from the server
	//Decode(signal.MustReadStdin(), &offer)
	// we should create the offer then then get the answer from the server.

	// Set the remote SessionDescription
	err = peerConnection.SetRemoteDescription(offer)
	if err != nil {
		panic(err)
	}

	// Create an answer
	answer, err := peerConnection.CreateAnswer(nil)
	if err != nil {
		panic(err)
	}

	// Create channel that is blocked until ICE Gathering is complete
	gatherComplete := webrtc.GatheringCompletePromise(peerConnection)

	// Sets the LocalDescription, and starts our UDP listeners
	err = peerConnection.SetLocalDescription(answer)
	if err != nil {
		panic(err)
	}

	// Block until ICE Gathering is complete, disabling trickle ICE
	// we do this because we only can exchange one signaling message
	// in a production application you should exchange ICE Candidates via OnICECandidate
	<-gatherComplete
*/
