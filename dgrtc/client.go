package dgrtc

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/pion/webrtc/v3"
)

type Config struct {
	Config webrtc.Configuration
}

func DefaultClient() *Config {
	config := &Config{
		Config: webrtc.Configuration{
			ICEServers: []webrtc.ICEServer{
				{
					URLs: []string{"stun:stun.l.google.com:19302"},
				},
			},
		},
	}
	return config
}

// take an address of the signaling server and a handle to identify the intended target. the keypair is used to authorize the connection.

type Lobby struct {
	host   string
	mu     sync.Mutex
	api    SocketLike
	config *Config
	ch     SocketLike
}

var lobbiesMux sync.Mutex
var lobby map[string]*Lobby

// when we first connect, we may need to provide a OTP? Or maybe we should exchange the otp for a key to use.

func NewLobby(host string, config *Config) (*Lobby, error) {
	if config == nil {
		config = DefaultClient()
	}
	cache := func() (*Lobby, error) {
		lobbiesMux.Lock()
		defer lobbiesMux.Unlock()
		if lobby == nil {
			lobby = make(map[string]*Lobby)
		}
		var lb *Lobby
		var ok bool
		if lb, ok = lobby[host]; ok {
			return lb, nil
		}
		return nil, nil
	}
	lb, e := cache()
	if e == nil {
		return lb, nil
	}
	lb = &Lobby{
		host:   host,
		mu:     sync.Mutex{},
		api:    nil,
		config: config,
	}

	lobby[host] = lb
	return lb, nil
}

func NewDataChannel(id *Identity, config *Config) (*DataChannel, error) {
	v := strings.Split(id.Channel, "@")
	lb, e := NewLobby(v[1], config)
	if e != nil {
		return nil, e
	}

	lb.mu.Lock()
	defer lb.mu.Unlock()
	if lb.ch == nil {
		// connect a datachannel to the host.
		dc, e := NewDirectChannel(lb.host, lb.config.Config)
		if e != nil {
			return nil, e
		}
		lb.ch = dc
	}
	_ = lb
	return nil, nil
}

func NewDirectChannel(host string, config webrtc.Configuration) (*DataChannel, error) {
	var wg sync.WaitGroup
	wg.Add(1)

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
				message := RandSeq(15)
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
			message := RandSeq(15)
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

	requestURL := fmt.Sprintf("https://%s/sdp", host)
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
