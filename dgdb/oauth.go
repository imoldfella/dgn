package dgdb

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/gorilla/sessions"

	"github.com/markbates/goth"
	"github.com/markbates/goth/gothic"
)

type ReadonlyKeyStore struct {
	Keys map[string]string
}

func (k *ReadonlyKeyStore) Get(key string) (string, error) {
	return k.Keys[key], nil
}

// how to break dependency on gorilla mux? we need patterns, we need a cookie store.
func OauthHandlers(p *mux.Router,
	host string,
	prefix string,
	done func(res http.ResponseWriter, req *http.Request, user goth.User),
	providers ...goth.Provider,
) {

	gothic.Store = sessions.NewCookieStore([]byte(os.Getenv("SESSION_SECRET")))

	goth.UseProviders(providers...)

	p.HandleFunc(prefix+"/{provider}/callback", func(res http.ResponseWriter, req *http.Request) {
		// we need this to redirect to complete. This will be a proxy from vite in development. Then we need to do something to engage the client.
		// we could catch this in the client and execute over a pipe?
		// would this be safer for a datachannel server?
		user, err := gothic.CompleteUserAuth(res, req)

		if err != nil {
			return
		}
		done(res, req, user)
	})
	p.HandleFunc(prefix+"/{provider}/start", func(w http.ResponseWriter, req *http.Request) {
		provider := mux.Vars(req)["provider"]
		w.Header().Add("Content-Type", "text/html")

		fmt.Fprintf(w, "<p><a href='%s/%s'>Log in with %s</a></p>", prefix, provider, provider)
	})
	// starts the process.
	p.HandleFunc(prefix+"/{provider}", func(res http.ResponseWriter, req *http.Request) {
		// try to get the user without re-authenticating
		if gothUser, err := gothic.CompleteUserAuth(res, req); err == nil {
			b, e := json.Marshal(&gothUser)
			if e != nil {
				return
			}
			res.Write(b)
		} else {
			// otherwise start.
			gothic.BeginAuthHandler(res, req)
		}
	})

	p.HandleFunc(prefix+"/logout/{provider}", func(res http.ResponseWriter, req *http.Request) {
		gothic.Logout(res, req)
		res.Header().Set("Location", "/")
		res.WriteHeader(http.StatusTemporaryRedirect)
	})
	p.HandleFunc(prefix+"/{provider}/test", func(res http.ResponseWriter, req *http.Request) {
		vars := mux.Vars(req)
		provider := vars["provider"]
		res.Write([]byte(fmt.Sprintf("<p><a href='%s/%s'>Log in with %s</a></p>", prefix, provider, provider)))
	})
}
