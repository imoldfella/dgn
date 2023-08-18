package main

import (
	"datagrove/webrtc"
	"embed"
	"io/fs"
	"log"
	"mime"
	"net/http"
	"os"
	"path"

	"github.com/joho/godotenv"
)

//go:embed ui/dist
var ui embed.FS

func main() {

	startWeb := func(addr string) {
		_ = mime.AddExtensionType(".js", "text/javascript")
		http.HandleFunc("/api/whap", corsHandler(webrtc.WhapHandler))
		http.HandleFunc("/api/whep", corsHandler(webrtc.WhepHandler))
		http.HandleFunc("/api/whip", corsHandler(webrtc.WhipHandler))
		http.HandleFunc("/api/status", corsHandler(webrtc.StatusHandler))
		http.HandleFunc("/api/sse/", corsHandler(webrtc.WhepServerSentEventsHandler))
		http.HandleFunc("/api/layer/", corsHandler(webrtc.WhepLayerHandler))

		log.Println("Running HTTP Server at `" + addr + "`")

		htmlContent, err := fs.Sub(ui, "ui/dist")
		if err != nil {
			return
		}

		fs := http.FileServer(&spaFileSystem{http.FS(htmlContent)})
		http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
			fs.ServeHTTP(w, r)
		})
		go http.ListenAndServe(addr, nil)
	}

	// can I use webrtc only for an api? Use any static file server to deliver
	godotenv.Load()
	addr := os.Getenv("HTTP_ADDRESS")
	if len(addr) == 0 {
		addr = ":8082"
	}
	startWeb(addr)

	var home string
	if len(os.Args) > 1 {
		home = os.Args[1]
	} else {
		home, _ = os.Getwd()
		home = path.Join(home, "home")
	}
	// wait for bots and people (https,sftp,ssh) to connect

	// // if home doesn't exist, try to create it.
	// var sx sshlib.Config = sshlib.Config{
	// 	Home:        home,
	// 	CompilerMap: compilerMap,
	// }

	// sshlib.Start(&sx)
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
