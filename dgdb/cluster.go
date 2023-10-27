package dgdb

import (
	"context"
	"encoding/json"
	"fmt"
	"io/fs"
	"log"
	"mime"
	"net/http"
	"os"
	"os/signal"
	"path"
	"strings"
	"time"

	"datagrove/dgrtc"

	"github.com/fxamacker/cbor/v2"
	"github.com/go-webauthn/webauthn/protocol"
	"github.com/go-webauthn/webauthn/webauthn"
	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"github.com/lesismal/llib/std/crypto/tls"
	"github.com/lesismal/nbio/nbhttp"
	"github.com/lesismal/nbio/nbhttp/websocket"
	"github.com/markbates/goth"
	"github.com/markbates/goth/providers/google"
	cmap "github.com/orcaman/concurrent-map/v2"
	"github.com/pion/webrtc/v3"
)

var api = &Api{
	Fn:  map[string]func(r *Rpcp) (any, error){},
	Fnj: map[string]func(r *Rpcpj) (any, error){},
}
var u *websocket.Upgrader

func WsHandler(w http.ResponseWriter, r *http.Request) {

	sv := &Session{
		Stdout: os.Stdout,
		Data:   make(map[string]interface{}),
	}
	fn := func(c *websocket.Conn, messageType websocket.MessageType, data []byte) {
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
				c.WriteMessage(websocket.TextMessage, b)
			} else {
				var o struct {
					Id     int64       `json:"id"`
					Result interface{} `json:"result"`
				}
				o.Id = rpc.Id
				o.Result = rx
				b, _ := json.Marshal(&o)
				log.Printf("sending %s", string(b))
				c.WriteMessage(websocket.TextMessage, b)
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
				c.WriteMessage(websocket.BinaryMessage, b)
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
				c.WriteMessage(websocket.BinaryMessage, b)
			}
		}
		c.SetReadDeadline(time.Now().Add(nbhttp.DefaultKeepaliveTime))
	}
	u := websocket.NewUpgrader()
	u.CheckOrigin = func(r *http.Request) bool { return true }
	u.OnOpen(func(c *websocket.Conn) {
		log.Printf("opened")
	})
	u.OnClose(func(c *websocket.Conn, err error) {
		log.Printf("closed")
	})
	u.OnMessage(fn)
	conn, err := u.Upgrade(w, r, nil)
	if err != nil {
		log.Print(err)
		return
	}
	_ = conn
	//conn.SetReadDeadline(1 * time.Second)
	// wsConn := conn.(*websocket.Conn)
	// wsConn.SetReadDeadline(time.Now().Add(nbhttp.DefaultKeepaliveTime))
}

// the cluster server runs on public internet, like ovh
// it is the root for CDN's, and can host multiple clients using wildcard domain.

func CentralServer(home string) {

}

// we probably want to read the config from a central server when we start up. central server should be VSR ring. Or maybe better start with a cache? r2 could be canonical storage. (It's not atomic though). Can we just redirect to a r2 bucket? It's not clear that we can because of wildcard. How long live can we make clients?  forever, and use a seperate channel to upgrade? Caddy has special mechanisms to serve files faster.
// caddy does not use sendFile for Tls, and compression on the fly. kTls is a thing, but may not be safe.

// /domain/version/...
// if version is v1, then we can redirect to the latest version.
type CoreServerConfig struct {
	Home    string
	Version cmap.ConcurrentMap[string, string]
}

func AddHandlers(p *mux.Router, c *CoreServerConfig) {
	cl, e := NewS3Client()
	if e != nil {
		panic(e)
	}

	// here we need to serve files based on the path from our cache, or if necessary retrieve them from R2.
	// we need a version that is "current", and redirect the client there. Redirect is safer because it would be atomic.

	p.PathPrefix("/").HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		subdomain := strings.Split(r.Host, ".")[0]
		ver, ok := c.Version.Get(subdomain)
		if !ok {
			// domain not recognized, maybe we need to refresh from central
			fmt.Fprintf(w, "404 not found %s", subdomain)
			return
		}

		pv := strings.Split(r.URL.Path, "/")
		v := pv[1]

		if v == "v" || v == "" {
			pth := path.Join(r.Host, ver, strings.Join(pv[2:], "/"))
			http.Redirect(w, r, pth, http.StatusMovedPermanently)
			return
		}
		cp := r.URL.Path
		x := path.Ext(r.URL.Path)
		if x == "" {
			cp = path.Join(cp, "index.html")
		}
		n := path.Join(c.Home, path.Join(subdomain, cp))
		// here we could find it in our cache to see what the hash of the file is, and then serve that. our service worker could do this? maybe this should only bootstrap a service worker and its initial database.
		// service worker could then request the exact hash of the file it wanted, this would have good cache properties?

		_, e := os.Stat(n)
		if e != nil {
			// try to get it from R2
			// is there a benefit in trying to sha hash to deduplicate?
			b, e := cl.Get(n)
			if e != nil {
				// 404
				fmt.Fprintf(w, "404 not found")
				return
			}
			os.WriteFile(n, b, 0644)
			http.ServeFile(w, r, n)
		}
		http.ServeFile(w, r, n)

		// fmt.Fprintf(w, "Hello, %q %q", html.EscapeString(r.URL.Path), html.EscapeString(r.Host))
	})
}

// all the core server does is look at the subdomain and serve it from a directory
// it can atomically switch this directory. unknown subdomain is 404
func CoreServer(home string) {
	m := cmap.New[string]()
	m.Set("x", "2")
	m.Set("y", "1")

	//c *CoreServerConfig
	// faster router here?
	// we need some kind of pattern matching like gorilla mux to get the provider.
	p := mux.NewRouter()
	AddHandlers(p, &CoreServerConfig{
		Home:    "./home",
		Version: m,
	})

	// somehow this needs to get switched to ACME
	// or potentially we use caddy in front of us?

	//p.HandleFunc("/ws", onWebsocket)
	rsaCertPEM, err := os.ReadFile("localhost.direct.crt")
	if err != nil {
		log.Fatalf("os.ReadFile failed: %v", err)
	}

	rsaKeyPEM, err := os.ReadFile("localhost.direct.key")
	if err != nil {
		log.Fatalf("os.ReadFile failed: %v", err)
	}
	cert, err := tls.X509KeyPair(rsaCertPEM, rsaKeyPEM)
	if err != nil {
		log.Fatalf("tls.X509KeyPair failed: %v", err)
	}
	tlsConfig := &tls.Config{
		Certificates:       []tls.Certificate{cert},
		InsecureSkipVerify: true,
	}
	svr := nbhttp.NewServer(nbhttp.Config{
		Network:   "tcp",
		AddrsTLS:  []string{"localhost.direct:8083"},
		TLSConfig: tlsConfig,
		Handler:   p,
	})

	err = svr.Start()
	if err != nil {
		fmt.Printf("nbio.Start failed: %v\n", err)
		return
	}

	interrupt := make(chan os.Signal, 1)
	signal.Notify(interrupt, os.Interrupt)
	<-interrupt
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	defer cancel()
	svr.Shutdown(ctx)
	//http.ListenAndServeTLS(addr, "localhost.direct.crt", "localhost.direct.key", nil)
}

// cluster server can't serve clients from embedded, because we need multiple client versions and variations mapped to the wildcard domains.
// when a user logs in, how do we know what client to give them? should we always give them the newest client, downgrade if necessary?
// in this case as well we can start them as a guest with the newest client, then can then login as necessary.
func ClusterServer(home string) {
	// we need some kind of pattern matching like gorilla mux to get the provider.
	p := mux.NewRouter()

	done := func(w http.ResponseWriter, r *http.Request, user goth.User) {
		b, e := json.Marshal(&user)
		if e != nil {
			return
		}
		w.Write(b)
	}

	host := "https://localhost.direct:8082"
	prefix := "/api"
	prgoogle := google.New(os.Getenv("GOOGLE_KEY"), os.Getenv("GOOGLE_SECRET"), host+prefix+"/google/callback")

	OauthHandlers(p, host, prefix, done, prgoogle)

	u = websocket.NewUpgrader()
	u.CheckOrigin = func(r *http.Request) bool { return true }
	data := make(map[string]interface{})

	e := WebauthnApi(api, Webauthn{
		PasskeyConfig: &webauthn.Config{
			RPID:          "localhost",
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
	if e != nil {
		log.Fatal(e)
	}
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
	p.HandleFunc("/wss", corsHandler(func(w http.ResponseWriter, r *http.Request) {
		WsHandler(w, r)
	}))
	p.HandleFunc("/api/whap", corsHandler(dgrtc.WhapHandler))
	p.HandleFunc("/api/whep", corsHandler(dgrtc.WhepHandler))
	p.HandleFunc("/api/whip", corsHandler(dgrtc.WhipHandler))
	p.HandleFunc("/api/status", corsHandler(dgrtc.StatusHandler))
	p.HandleFunc("/api/sse/", corsHandler(dgrtc.WhepServerSentEventsHandler))
	p.HandleFunc("/api/layer/", corsHandler(dgrtc.WhepLayerHandler))
	p.HandleFunc("/hello", corsHandler(func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("hello"))
	}))

	p.HandleFunc("/sdp", corsHandler(func(w http.ResponseWriter, r *http.Request) {

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
	p.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fs.ServeHTTP(w, r)
	})

	//p.HandleFunc("/ws", onWebsocket)
	rsaCertPEM, err := os.ReadFile("localhost.direct.crt")
	if err != nil {
		log.Fatalf("os.ReadFile failed: %v", err)
	}

	rsaKeyPEM, err := os.ReadFile("localhost.direct.key")
	if err != nil {
		log.Fatalf("os.ReadFile failed: %v", err)
	}
	cert, err := tls.X509KeyPair(rsaCertPEM, rsaKeyPEM)
	if err != nil {
		log.Fatalf("tls.X509KeyPair failed: %v", err)
	}
	tlsConfig := &tls.Config{
		Certificates:       []tls.Certificate{cert},
		InsecureSkipVerify: true,
	}
	svr := nbhttp.NewServer(nbhttp.Config{
		Network:   "tcp",
		AddrsTLS:  []string{"localhost.direct:8082"},
		TLSConfig: tlsConfig,
		Handler:   p,
	})

	err = svr.Start()
	if err != nil {
		fmt.Printf("nbio.Start failed: %v\n", err)
		return
	}

	interrupt := make(chan os.Signal, 1)
	signal.Notify(interrupt, os.Interrupt)
	<-interrupt
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	defer cancel()
	svr.Shutdown(ctx)
	//http.ListenAndServeTLS(addr, "localhost.direct.crt", "localhost.direct.key", nil)

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
