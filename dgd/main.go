package main

import (
	"datagrove/sshlib"
	"embed"
	"encoding/json"
	"fmt"
	"io"
	"io/fs"
	"log"
	"mime"
	"net/http"
	"os"
	"path"
	"strings"

	"github.com/joho/godotenv"
)

//go:embed ui/dist/**
var ui embed.FS

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

func startWeb() {
	_ = mime.AddExtensionType(".js", "text/javascript")

	htmlContent, err := fs.Sub(ui, "ui/dist")
	if err != nil {
		return
	}

	fs := http.FileServer(&spaFileSystem{http.FS(htmlContent)})
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fs.ServeHTTP(w, r)
	})
	go http.ListenAndServe(":8080", nil)
}

// Json structure of options for the 1199 job.
// compose of normal things like directories etc.
type Daily1199 struct {
}

func main() {
	// can I use webrtc only for an api? Use any static file server to deliver
	startWeb()

	// each task corresponds to a json file in the task directory.
	// v2 will build the compiler map from golang scripts/git repos directly. this will require an extra level of indirection as we isolate the generated task in a process.
	compilerMap := map[string]func(arg []byte) (sshlib.Task, error){
		"1199": func(config []byte) (sshlib.Task, error) {
			var tu Daily1199
			e := json.Unmarshal(config, &tu)
			if e != nil {
				return nil, e
			}
			return func(_ *sshlib.TaskContext) string {
				return "daily 1199 processing"
			}, nil
		},
	}
	WriteSchemas := func(dir string) {

	}

	var home string
	if len(os.Args) > 1 {
		home = os.Args[1]
	} else {
		home, _ = os.Getwd()
		home = path.Join(home, "home")
	}
	// if home doesn't exist, try to create it.
	var sx sshlib.Config = sshlib.Config{
		Home:        home,
		CompilerMap: compilerMap,
	}
	b, e := os.ReadFile(home + "/config.json")
	if e != nil {
		os.MkdirAll(home, 0755)
		os.MkdirAll(home+"/data", 0755)
		os.MkdirAll(home+"/keys", 0755)
		os.MkdirAll(home+"/schema", 0755)

		// write the schema for the commands in this executable
		// we need to run this again whenever we update the executable.
		WriteSchemas(home + "/schema")

		sx.Options = sshlib.Options{
			Banner: "Aetna-1199 Server",
			Url:    ":2022",
			// I need a way to load this from an existing config?
			Data: home + "/data",
		}
		b, _ := json.Marshal(&sx.Options)
		os.WriteFile(home+"/config.json", b, 0644)
	}

	e = json.Unmarshal(b, &sx)
	if e != nil {
		panic(e.Error())
	}

	sshlib.Start(&sx)
}

func getUi() (http.Handler, error) {
	var staticFS = fs.FS(ui)
	// ui/dist should be in config?
	htmlContent, err := fs.Sub(staticFS, "ui/dist")
	if err != nil {
		return nil, err
	}
	return http.FileServer(&spaFileSystem{http.FS(htmlContent)}), nil
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

type (
	whepLayerRequestJSON struct {
		MediaId    string `json:"mediaId"`
		EncodingId string `json:"encodingId"`
	}
)

func logHTTPError(w http.ResponseWriter, err string, code int) {
	log.Println(err)
	http.Error(w, err, code)
}

func whapHandler(res http.ResponseWriter, r *http.Request) {
	streamKey := r.Header.Get("Authorization")
	if streamKey == "" {
		logHTTPError(res, "Authorization was not set", http.StatusBadRequest)
		return
	}

	offer, err := io.ReadAll(r.Body)
	if err != nil {
		logHTTPError(res, err.Error(), http.StatusBadRequest)
		return
	}

	answer, err := WHAP(string(offer))
	if err != nil {
		logHTTPError(res, err.Error(), http.StatusBadRequest)
		return
	}

	res.WriteHeader(http.StatusCreated)
	fmt.Fprint(res, answer)
}

func whipHandler(res http.ResponseWriter, r *http.Request) {
	streamKey := r.Header.Get("Authorization")
	if streamKey == "" {
		logHTTPError(res, "Authorization was not set", http.StatusBadRequest)
		return
	}

	offer, err := io.ReadAll(r.Body)
	if err != nil {
		logHTTPError(res, err.Error(), http.StatusBadRequest)
		return
	}

	answer, err := WHIP(string(offer), streamKey)
	if err != nil {
		logHTTPError(res, err.Error(), http.StatusBadRequest)
		return
	}

	res.WriteHeader(http.StatusCreated)
	fmt.Fprint(res, answer)
}

// what should authorization be here? maybe a uuid identifying the database being offered? how do challenge this? I guess wait for the data channel to be established?

func whepHandler(res http.ResponseWriter, req *http.Request) {
	streamKey := req.Header.Get("Authorization")
	if streamKey == "" {
		logHTTPError(res, "Authorization was not set", http.StatusBadRequest)
		return
	}

	offer, err := io.ReadAll(req.Body)
	if err != nil {
		logHTTPError(res, err.Error(), http.StatusBadRequest)
		return
	}

	answer, whepSessionId, err := WHEP(string(offer), streamKey)
	if err != nil {
		logHTTPError(res, err.Error(), http.StatusBadRequest)
		return
	}

	apiPath := req.Host + strings.TrimSuffix(req.URL.RequestURI(), "whep")
	res.Header().Add("Link", `<`+apiPath+"sse/"+whepSessionId+`>; rel="urn:ietf:params:whep:ext:core:server-sent-events"; events="layers"`)
	res.Header().Add("Link", `<`+apiPath+"layer/"+whepSessionId+`>; rel="urn:ietf:params:whep:ext:core:layer"`)
	fmt.Fprint(res, answer)
}

func whepServerSentEventsHandler(res http.ResponseWriter, req *http.Request) {
	res.Header().Set("Content-Type", "text/event-stream")
	res.Header().Set("Cache-Control", "no-cache")
	res.Header().Set("Connection", "keep-alive")

	vals := strings.Split(req.URL.RequestURI(), "/")
	whepSessionId := vals[len(vals)-1]

	layers, err := WHEPLayers(whepSessionId)
	if err != nil {
		logHTTPError(res, err.Error(), http.StatusBadRequest)
		return
	}

	fmt.Fprint(res, "event: layers\n")
	fmt.Fprintf(res, "data: %s\n", string(layers))
	fmt.Fprint(res, "\n\n")
}

func whepLayerHandler(res http.ResponseWriter, req *http.Request) {
	var r whepLayerRequestJSON
	if err := json.NewDecoder(req.Body).Decode(&r); err != nil {
		logHTTPError(res, err.Error(), http.StatusBadRequest)
		return
	}

	vals := strings.Split(req.URL.RequestURI(), "/")
	whepSessionId := vals[len(vals)-1]

	if err := WHEPChangeLayer(whepSessionId, r.EncodingId); err != nil {
		logHTTPError(res, err.Error(), http.StatusBadRequest)
		return
	}
}

type StreamStatus struct {
	StreamKey string `json:"streamKey"`
}

func statusHandler(res http.ResponseWriter, req *http.Request) {
	statuses := []StreamStatus{}
	for _, s := range GetAllStreams() {
		statuses = append(statuses, StreamStatus{StreamKey: s})
	}

	if err := json.NewEncoder(res).Encode(statuses); err != nil {
		logHTTPError(res, err.Error(), http.StatusBadRequest)
	}
}

func main2() {
	godotenv.Load()

	Configure()

	h, e := getUi()
	if e != nil {
		log.Fatal(e)
	}
	mux := http.NewServeMux()

	mux.HandleFunc("/api/whap", corsHandler(whapHandler))
	mux.HandleFunc("/api/whep", corsHandler(whepHandler))

	mux.HandleFunc("/api/whip", corsHandler(whipHandler))
	mux.HandleFunc("/api/status", corsHandler(statusHandler))
	mux.HandleFunc("/api/sse/", corsHandler(whepServerSentEventsHandler))
	mux.HandleFunc("/api/layer/", corsHandler(whepLayerHandler))
	mux.Handle("/", h)

	log.Println("Running HTTP Server at `" + os.Getenv("HTTP_ADDRESS") + "`")

	log.Fatal((&http.Server{
		Handler: mux,
		Addr:    os.Getenv("HTTP_ADDRESS"),
	}).ListenAndServe())
}
