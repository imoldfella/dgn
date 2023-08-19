package main

import (
	"bytes"
	"datagrove/bot"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/pion/webrtc/v3"
)

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

// connecting to a bot might entail us becoming the bot if the bot is down.
// how do we indicate our willingness to become the bot?
// ConnectOrBecome("bot")

func RemoteCommand(target string, cmd []string) error {
	v := strings.Split(target, "@")
	if len(v) != 2 {
		return fmt.Errorf("invalid target")
	}
	botname := v[0]
	host := v[1]
	// get a socketlike connection over webrtc.
	dgd, e := Connect(host)
	if e != nil {
		return e
	}

	// connect to a bot using dgd. Fails if bot is not online
	bot, e := dgd.Connect(botname)
	// ideally we should be able to connect a stream to the bot, to act like a terminal. this lets the bot have some more display options?
	fmt.Println()
	_ = bot
	return nil
}

func SshProxy(target string) error {

	return nil
}

type Datagrove struct {
}

func (d *Datagrove) Connect(botname string) (*BotConnection, error) {
	return nil, nil
}
func (d *BotConnection) Session() (*Session, error) {
	return nil, nil
}

type BotConnection struct {
}

type Session struct {
	Stdout io.Writer
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

func Connect(host string) (*Datagrove, error) {
	// use cobra to allow dgc to directly act as a substitute for ssh, or to act as a proxy for sftp.

	//

	var wg sync.WaitGroup
	wg.Add(1)
	dgdUrl := "x.localhost.direct:8082"
	config := webrtc.Configuration{
		ICEServers: []webrtc.ICEServer{
			{
				//URLs: []string{"stun:stun.l.google.com:19302"},
			},
		},
	}

	// Create a new RTCPeerConnection
	peerConnection, err := webrtc.NewPeerConnection(config)
	if err != nil {
		panic(err)
	}
	defer func() {
		if cErr := peerConnection.Close(); cErr != nil {
			fmt.Printf("cannot close peerConnection: %v\n", cErr)
		}
	}()

	// Create a datachannel with label 'data'
	dataChannel, err := peerConnection.CreateDataChannel("data", nil)
	if err != nil {
		panic(err)
	}

	// Set the handler for Peer connection state
	// This will notify you when the peer has connected/disconnected
	peerConnection.OnConnectionStateChange(func(s webrtc.PeerConnectionState) {
		fmt.Printf("Peer Connection State has changed: %s\n", s.String())

		if s == webrtc.PeerConnectionStateFailed {
			// Wait until PeerConnection has had no network activity for 30 seconds or another failure. It may be reconnected using an ICE Restart.
			// Use webrtc.PeerConnectionStateDisconnected if you are interested in detecting faster timeout.
			// Note that the PeerConnection may come back from PeerConnectionStateDisconnected.
			fmt.Println("Peer Connection has gone to failed exiting")
			os.Exit(0)
		}
	})

	peerConnection.OnDataChannel(func(d *webrtc.DataChannel) {
		fmt.Printf("New DataChannel %s %d\n", d.Label(), d.ID())

		// Register channel opening handling
		d.OnOpen(func() {
			fmt.Printf("Data channel '%s'-'%d' open. Random messages will now be sent to any connected DataChannels every 5 seconds\n", d.Label(), d.ID())

			for range time.NewTicker(5 * time.Second).C {
				message := bot.RandSeq(15)
				fmt.Printf("Sending '%s'\n", message)

				// Send the message as text
				sendErr := d.SendText(message)
				if sendErr != nil {
					panic(sendErr)
				}
			}
		})

		// Register text message handling
		d.OnMessage(func(msg webrtc.DataChannelMessage) {
			fmt.Printf("Message from DataChannel '%s': '%s'\n", d.Label(), string(msg.Data))
		})
	})

	// Register channel opening handling
	dataChannel.OnOpen(func() {
		fmt.Printf("Data channel '%s'-'%d' open. Random messages will now be sent to any connected DataChannels every 5 seconds\n", dataChannel.Label(), dataChannel.ID())

		for range time.NewTicker(5 * time.Second).C {
			message := bot.RandSeq(15)
			fmt.Printf("Sending '%s'\n", message)

			// Send the message as text
			sendTextErr := dataChannel.SendText(message)
			if sendTextErr != nil {
				panic(sendTextErr)
			}
		}
	})

	// Register text message handling
	dataChannel.OnMessage(func(msg webrtc.DataChannelMessage) {
		fmt.Printf("Message from DataChannel '%s': '%s'\n", dataChannel.Label(), string(msg.Data))
		wg.Done()
	})

	// Create an offer to send to the other process
	offer, err := peerConnection.CreateOffer(nil)
	if err != nil {
		panic(err)
	}
	// Sets the LocalDescription, and starts our UDP listeners
	// Note: this will start the gathering of ICE candidates
	if err = peerConnection.SetLocalDescription(offer); err != nil {
		panic(err)
	}

	// Send our offer to the HTTP server listening in the other process
	// we should get back an answer that always works (no turn or ice here)
	payload, err := json.Marshal(offer)
	if err != nil {
		panic(err)
	}

	requestURL := fmt.Sprintf("https://%s/sdp", dgdUrl)
	req, err := http.NewRequest(http.MethodPut, requestURL, bytes.NewReader(payload))
	if err != nil {
		fmt.Printf("client: could not create request: %s\n", err)
		os.Exit(1)
	}
	req.Header.Add("Authorization", "password")
	req.Header.Add("Content-Type", "application/json; charset=utf-8")
	res, err := http.DefaultClient.Do(req)
	if err != nil {
		fmt.Printf("client: error making http request: %s\n", err)
		os.Exit(1)
	}

	resBody, err := io.ReadAll(res.Body)
	if err != nil {
		fmt.Printf("client: could not read response body: %s\n", err)
		os.Exit(1)
	}
	fmt.Printf("client: response body: %s\n", resBody)

	var sdp webrtc.SessionDescription
	// sdp.Type = webrtc.SDPTypeAnswer
	// sdp.SDP = string(resBody)
	json.Unmarshal(resBody, &sdp)
	if sdpErr := peerConnection.SetRemoteDescription(sdp); sdpErr != nil {
		panic(sdpErr)
	}

	//peerConnection.

	// 	for _, c := range pendingCandidates {
	// 		if onICECandidateErr := signalCandidate(*answerAddr, c); onICECandidateErr != nil {
	// 			panic(onICECandidateErr)
	// 		}
	// 	}
	// }
	// Register data channel creation handling
	wg.Wait()
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
