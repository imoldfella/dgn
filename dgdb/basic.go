package dgdb

import (
	"datagrove/dgrtc"
	"embed"
	"encoding/json"
	"fmt"
	"io/fs"
	"log"
	"mime"
	"net/http"
	"os"
	"time"

	"github.com/fxamacker/cbor/v2"
	"github.com/go-webauthn/webauthn/protocol"
	"github.com/go-webauthn/webauthn/webauthn"
	"github.com/joho/godotenv"
	"github.com/lesismal/nbio/nbhttp"
	"github.com/lesismal/nbio/nbhttp/websocket"
	"github.com/pion/webrtc/v3"
)

//go:embed ui/dist
var ui embed.FS

var api = &Api{
	Fn:  map[string]func(r *Rpcp) (any, error){},
	Fnj: map[string]func(r *Rpcpj) (any, error){},
}
var u *websocket.Upgrader

func WsHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := u.Upgrade(w, r, nil)
	if err != nil {
		log.Print(err)
		return
	}
	// sock := &Socket{
	// 	Svr:     svr,
	// 	Session: nil,
	// }
	// sv, e := svr.NewSession(sock)
	// if e != nil {
	// 	return
	// }
	// sock.Session = sv
	sv := &Session{
		Stdout: os.Stdout,
		Data:   make(map[string]interface{}),
	}

	u := websocket.NewUpgrader()
	u.CheckOrigin = func(r *http.Request) bool { return true }
	u.OnMessage(func(c *websocket.Conn, messageType websocket.MessageType, data []byte) {

		if messageType != websocket.BinaryMessage {
			var rpc Rpcpj

			rpc.Session = sv
			json.Unmarshal(data, &rpc.Rpcj)
			r, ok := api.Fnj[rpc.Method]
			if !ok {
				log.Printf("bad method %s", rpc.Method)
				return
			}
			rx, err := r(&rpc)
			if err != nil {
				var o struct {
					Id    int64  `json:"id"`
					Error string `json:"error"`
				}
				o.Id = rpc.Id
				o.Error = err.Error()
				b, _ := json.Marshal(&o)
				conn.WriteMessage(websocket.TextMessage, b)
			} else {
				var o struct {
					Id     int64       `json:"id"`
					Result interface{} `json:"result"`
				}
				o.Id = rpc.Id
				o.Result = rx
				b, _ := json.Marshal(&o)
				log.Printf("sending %s", string(b))
				conn.WriteMessage(websocket.TextMessage, b)
			}
		} else {
			var rpc Rpcp
			rpc.Session = sv
			cbor.Unmarshal(data, &rpc.Rpc)
			r, ok := api.Fn[rpc.Method]
			if !ok {
				log.Printf("bad method %s", rpc.Method)
				return
			}
			rx, err := r(&rpc)
			if err != nil {
				var o struct {
					Id    int64  `json:"id"`
					Error string `json:"error"`
				}
				o.Id = rpc.Id
				o.Error = err.Error()
				b, _ := cbor.Marshal(&o)
				conn.WriteMessage(websocket.BinaryMessage, b)
			} else {
				var o struct {
					Id     int64       `json:"id"`
					Result interface{} `json:"result"`
				}
				o.Id = rpc.Id
				o.Result = rx
				bs, _ := json.MarshalIndent(o, "", "  ")
				log.Printf("sending %s", string(bs))
				b, _ := cbor.Marshal(&o)
				conn.WriteMessage(websocket.BinaryMessage, b)
			}
		}
		conn.SetReadDeadline(time.Now().Add(nbhttp.DefaultKeepaliveTime))
	})
}

func BasicServer(home string) {
	data := make(map[string]interface{})

	u = websocket.NewUpgrader()
	WebauthnApi(api, Webauthn{
		PasskeyConfig: &webauthn.Config{
			RPID:          "localhost.direct",
			RPDisplayName: "Datagrove",
			RPOrigins: []string{
				"https://localhost:5173",
			},
			AttestationPreference:  "",
			AuthenticatorSelection: protocol.AuthenticatorSelection{},
			Debug:                  false,
			EncodeUserIDAsString:   true,
			Timeouts:               webauthn.TimeoutsConfig{},
			RPIcon:                 "",
			RPOrigin:               "datagrove.com",
			Timeout:                0,
		},
		DisplayName: "",
		LoadPasskey: func(id string) (*PasskeyCredential, error) {
			x, ok := data[id]
			if !ok {
				return nil, fmt.Errorf("no such user")
			}
			return x.(*PasskeyCredential), nil
		},
		RegisterPasskey: func(c *PasskeyCredential) error {
			data[c.ID] = c
			return nil
		},
	})
	// users on the basic server start by following a rollup of all the bots on the local server.

	// var candidatesMux sync.Mutex
	// pendingCandidates := make([]*webrtc.ICECandidate, 0)
	// Create a new RTCPeerConnection
	config := webrtc.Configuration{
		ICEServers: []webrtc.ICEServer{
			{
				//URLs: []string{"stun:stun.l.google.com:19302"},
			},
		},
	}

	peerConnection, err := webrtc.NewPeerConnection(config)
	if err != nil {
		panic(err)
	}
	defer func() {
		if err := peerConnection.Close(); err != nil {
			fmt.Printf("cannot close peerConnection: %v\n", err)
		}
	}()
	// can I use webrtc only for an api? Use any static file server to deliver
	godotenv.Load()
	addr := os.Getenv("HTTP_ADDRESS")
	if len(addr) == 0 {
		addr = ":8082"
	}

	// whap seems underspecified

	_ = mime.AddExtensionType(".js", "text/javascript")
	http.HandleFunc("/wss", corsHandler(func(w http.ResponseWriter, r *http.Request) {
		WsHandler(w, r)
	}))
	http.HandleFunc("/api/whap", corsHandler(dgrtc.WhapHandler))
	http.HandleFunc("/api/whep", corsHandler(dgrtc.WhepHandler))
	http.HandleFunc("/api/whip", corsHandler(dgrtc.WhipHandler))
	http.HandleFunc("/api/status", corsHandler(dgrtc.StatusHandler))
	http.HandleFunc("/api/sse/", corsHandler(dgrtc.WhepServerSentEventsHandler))
	http.HandleFunc("/api/layer/", corsHandler(dgrtc.WhepLayerHandler))
	http.HandleFunc("/hello", corsHandler(func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("hello"))
	}))

	http.HandleFunc("/sdp", corsHandler(func(w http.ResponseWriter, r *http.Request) {

		sdp := webrtc.SessionDescription{}
		if err := json.NewDecoder(r.Body).Decode(&sdp); err != nil {
			panic(err)
		}

		if err := peerConnection.SetRemoteDescription(sdp); err != nil {
			panic(err)
		}
		peerConnection.OnConnectionStateChange(func(s webrtc.PeerConnectionState) {
			fmt.Printf("Peer Connection State has changed: %s\n", s.String())
			if s == webrtc.PeerConnectionStateFailed {
				fmt.Println("Peer Connection has gone to failed exiting")
			}
		})
		gatherComplete := webrtc.GatheringCompletePromise(peerConnection)

		peerConnection.OnDataChannel(func(d *webrtc.DataChannel) {
			d.OnOpen(func() {
				log.Printf("Data channel '%s'-'%d' open.\n", d.Label(), d.ID())
			})
			d.OnMessage(func(msg webrtc.DataChannelMessage) {
				log.Printf("Message from DataChannel '%s': '%s'\n", d.Label(), string(msg.Data))
			})
			d.SendText("Hello World!")
			d.OnClose(func() {
				log.Println("Data channel closed")
			})
			d.OnError(func(err error) {
				log.Println("Data channel error", err)
			})
		})
		// Create an answer to send to the other process
		answer, err := peerConnection.CreateAnswer(nil)
		if err != nil {
			panic(err)
		} else if err = peerConnection.SetLocalDescription(answer); err != nil {
			panic(err)
		}
		<-gatherComplete

		// Send our answer to the HTTP server listening in the other process
		payload, err := json.Marshal(peerConnection.LocalDescription())
		if err != nil {
			panic(err)
		}
		w.Header().Set("Content-Type", "application/sdp")
		w.Write(payload)
		w.WriteHeader(201)
	}))

	log.Println("Running HTTP Server at `" + addr + "`")

	htmlContent, err := fs.Sub(ui, "ui/dist")
	if err != nil {
		return
	}

	// this is last, others should take priority.
	fs := http.FileServer(&spaFileSystem{http.FS(htmlContent)})
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fs.ServeHTTP(w, r)
	})
	http.ListenAndServeTLS(addr, "localhost.direct.crt", "localhost.direct.key", nil)

}

type spaFileSystem struct {
	root http.FileSystem
}

func (fs *spaFileSystem) Open(name string) (http.File, error) {
	f, err := fs.root.Open(name)
	if os.IsNotExist(err) {
		return fs.root.Open("index.html")
	}
	return f, err
}

func corsHandler(next func(w http.ResponseWriter, r *http.Request)) http.HandlerFunc {
	return func(res http.ResponseWriter, req *http.Request) {
		res.Header().Set("Access-Control-Allow-Origin", "*")
		res.Header().Set("Access-Control-Allow-Methods", "*")
		res.Header().Set("Access-Control-Allow-Headers", "*")
		res.Header().Set("Access-Control-Expose-Headers", "*")

		if req.Method != http.MethodOptions {
			next(res, req)
		}
	}
}
