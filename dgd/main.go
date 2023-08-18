package main

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
	"path"

	"github.com/joho/godotenv"
	"github.com/pion/webrtc/v3"
)

//go:embed ui/dist
var ui embed.FS

func main() {
	// var candidatesMux sync.Mutex
	// pendingCandidates := make([]*webrtc.ICECandidate, 0)
	// Create a new RTCPeerConnection
	config := webrtc.Configuration{
		ICEServers: []webrtc.ICEServer{
			{
				URLs: []string{"stun:stun.l.google.com:19302"},
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

	var home string
	if len(os.Args) > 1 {
		home = os.Args[1]
	} else {
		home, _ = os.Getwd()
		home = path.Join(home, "home")
	}

	// whap seems underspecified

	_ = mime.AddExtensionType(".js", "text/javascript")
	http.HandleFunc("/api/whap", corsHandler(dgrtc.WhapHandler))
	http.HandleFunc("/api/whep", corsHandler(dgrtc.WhepHandler))
	http.HandleFunc("/api/whip", corsHandler(dgrtc.WhipHandler))
	http.HandleFunc("/api/status", corsHandler(dgrtc.StatusHandler))
	http.HandleFunc("/api/sse/", corsHandler(dgrtc.WhepServerSentEventsHandler))
	http.HandleFunc("/api/layer/", corsHandler(dgrtc.WhepLayerHandler))
	http.HandleFunc("/sdp", func(w http.ResponseWriter, r *http.Request) {
		sdp := webrtc.SessionDescription{}
		if err := json.NewDecoder(r.Body).Decode(&sdp); err != nil {
			panic(err)
		}

		if err := peerConnection.SetRemoteDescription(sdp); err != nil {
			panic(err)
		}

		// Create an answer to send to the other process
		answer, err := peerConnection.CreateAnswer(nil)
		if err != nil {
			panic(err)
		}

		// Send our answer to the HTTP server listening in the other process
		payload, err := json.Marshal(answer)
		if err != nil {
			panic(err)
		}
		w.Header().Set("Content-Type", "application/json")
		w.Write(payload)
		w.WriteHeader(200)
		// resp, err := http.Post(fmt.Sprintf("http://%s/sdp", *offerAddr), "application/json; charset=utf-8", bytes.NewReader(payload)) // nolint:noctx
		// if err != nil {
		// 	panic(err)
		// } else if closeErr := resp.Body.Close(); closeErr != nil {
		// 	panic(closeErr)
		// }

		// Sets the LocalDescription, and starts our UDP listeners
		err = peerConnection.SetLocalDescription(answer)
		if err != nil {
			panic(err)
		}

		// candidatesMux.Lock()
		// for _, c := range pendingCandidates {
		// 	onICECandidateErr := signalCandidate(*offerAddr, c)
		// 	if onICECandidateErr != nil {
		// 		panic(onICECandidateErr)
		// 	}
		// }
		// candidatesMux.Unlock()
	})

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
