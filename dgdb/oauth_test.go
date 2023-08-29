package dgdb

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"testing"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"github.com/markbates/goth"
	"github.com/markbates/goth/providers/google"
)

func Test_one(t *testing.T) {
	godotenv.Load()

	// we need some kind of pattern matching like gorilla mux to get the provider.
	p := mux.NewRouter()
	p.HandleFunc("/", func(res http.ResponseWriter, req *http.Request) {
		res.Write([]byte("<p><a href='/auth/google'>Log in with Google</a></p>"))
	})
	done := func(w http.ResponseWriter, r *http.Request, user goth.User) {
		b, e := json.Marshal(&user)
		if e != nil {
			return
		}
		w.Write(b)
	}

	host := "http://localhost:3000"
	prefix := "/auth"
	prgoogle := google.New(os.Getenv("GOOGLE_KEY"), os.Getenv("GOOGLE_SECRET"), host+prefix+"/google/callback")

	OauthHandlers(p, host, prefix, done, prgoogle)
	log.Println("listening on localhost:3000")
	log.Fatal(http.ListenAndServe(":3000", p))
}
