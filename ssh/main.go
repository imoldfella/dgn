package main

import (
	"embed"
	"io/fs"
	"mime"
	"net/http"
	"os"
)

//go:embed ui/dist/*
var staticFiles embed.FS

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

func main() {
	_ = mime.AddExtensionType(".js", "text/javascript")

	htmlContent, err := fs.Sub(staticFiles, "ui/dist")
	if err != nil {
		return
	}

	fs := http.FileServer(&spaFileSystem{http.FS(htmlContent)})
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fs.ServeHTTP(w, r)
	})
	http.ListenAndServe(":8080", nil)
}
