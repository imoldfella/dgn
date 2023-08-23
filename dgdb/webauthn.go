package dgdb

import (
	"bytes"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"

	"github.com/go-webauthn/webauthn/protocol"
	"github.com/go-webauthn/webauthn/webauthn"
)

type Device struct {
	Id   string `json:"id"`
	Name string
}
type PasskeyCredential struct {
	ID string `json:"id"`
	// Is there any point in storing these?
	Name string `json:"name"`
	// DisplayName string `json:"display_name"`
	// Icon        string `json:"icon,omitempty"`
	// is ID here different than ID in Credential?
	Credential webauthn.Credential `json:"credentials,omitempty"`
}

func (u *PasskeyCredential) WebAuthnID() []byte {
	return []byte(u.ID)
}

// WebAuthnName provides the name attribute of the user account during registration and is a human-palatable name for the user
// account, intended only for display. For example, "Alex Müller" or "田中倫". The Relying Party SHOULD let the user
// choose this, and SHOULD NOT restrict the choice more than necessary.
//
// Specification: §5.4.3. User Account Parameters for Credential Generation (https://w3c.github.io/webauthn/#dictdef-publickeycredentialuserentity)
func (u *PasskeyCredential) WebAuthnName() string {
	return u.Name
}

// WebAuthnDisplayName provides the name attribute of the user account during registration and is a human-palatable
// name for the user account, intended only for display. For example, "Alex Müller" or "田中倫". The Relying Party
// SHOULD let the user choose this, and SHOULD NOT restrict the choice more than necessary.
//
// Specification: §5.4.3. User Account Parameters for Credential Generation (https://www.w3.org/TR/webauthn/#dom-publickeycredentialuserentity-displayname)
func (u *PasskeyCredential) WebAuthnDisplayName() string {
	return u.Name
}

// WebAuthnCredentials provides the list of Credential objects owned by the user. (why more than one?
func (u *PasskeyCredential) WebAuthnCredentials() []webauthn.Credential {
	return []webauthn.Credential{u.Credential}
}

// WebAuthnIcon is a deprecated option.
// Deprecated: this has been removed from the specification recommendation. Suggest a blank string.
func (u *PasskeyCredential) WebAuthnIcon() string {
	return ""
}

var _ webauthn.User = (*PasskeyCredential)(nil)

//	func response(w http.ResponseWriter, d string, c int) {
//		w.Header().Set("Content-Type", "application/json")
//		w.WriteHeader(c)
//		fmt.Fprintf(w, "%s", d)
//	}

var (
// web  *webauthn.WebAuthn
// data *webauthn.SessionData
// err  error
// user = NewUser("test_user")
)

func NewUser(s string) *PasskeyCredential {
	u := &PasskeyCredential{}
	u.Name = s
	u.ID = s
	return u
}
func Filter[T any](ss []T, test func(T) bool) (ret []T) {
	for _, s := range ss {
		if test(s) {
			ret = append(ret, s)
		}
	}
	return
}

type Update struct {
}

type Webauthn struct {
	DisplayName     string
	LoadPasskey     func(id string) (*PasskeyCredential, error)
	RegisterPasskey func(c *PasskeyCredential) error
}

// cbor messages can begin with 0 - that doesn't make sense for json
// make into websockets?
func WebauthnApi(mg *Api, wa Webauthn) error {
	web, err := webauthn.New(mg.PasskeyConfig)
	if err != nil {
		return err
	}

	// user name, not unique. produce challenge
	// change device id to be random, then don't use it that often.
	mg.AddApij("register", false, func(r *Rpcpj) (any, error) {
		var v struct {
			Name string `json:"name"`
		}
		e := json.Unmarshal(r.Params, &v)
		if e != nil {
			return nil, e
		}

		var c PasskeyCredential
		c.Name = v.Name
		c.ID, e = GenerateRandomString(32)
		if e != nil {
			return nil, e
		}

		options, session, err := web.BeginRegistration(&c)
		if err != nil {
			return nil, err
		}
		r.Session.Data["webauthn"] = session
		r.Session.Data["passkey"] = &c
		return options, nil
	})
	// part 2 of register, create a unique user.
	mg.AddApij("registerb", false, func(r *Rpcpj) (any, error) {
		response, err := protocol.ParseCredentialCreationResponseBody(bytes.NewReader(r.Params))
		if err != nil {
			return nil, err
		}
		// when we create this credential we need to also store it to the user file

		user := r.Session.Data["passkey"].(*PasskeyCredential)
		sess := *r.Session.Data["webauthn"].(*webauthn.SessionData)
		credential, err := web.CreateCredential(user, sess, response)
		if err != nil {
			return nil, err
		}
		user.Credential = *credential
		err = wa.RegisterPasskey(user)
		return err == nil, err
	})

	mg.AddApij("login", false, func(r *Rpcpj) (any, error) {

		// before we call this we need to load the user credentials
		options, session, err := web.BeginDiscoverableLogin()
		if err != nil {
			return nil, err
		}
		r.Session.Data["webauthn"] = session
		return options, nil
	})

	mg.AddApij("login2", false, func(r *Rpcpj) (any, error) {
		response, err := protocol.ParseCredentialRequestResponseBody(bytes.NewReader(r.Params))
		if err != nil {
			return nil, err
		}

		handler := func(rawID, userHandle []byte) (webauthn.User, error) {
			return wa.LoadPasskey(string(userHandle))
		}
		d := r.Session.Data["webauthn"].(*webauthn.SessionData)
		credential, err := web.ValidateDiscoverableLogin(handler, *d, response)
		if err != nil {
			return nil, err
		}

		return credential, nil //  mg.LoginInfoFromOid(r.Session, r.Oid)
	})
	return nil

}

// GenerateRandomBytes returns securely generated random bytes.
// It will return an error if the system's secure random
// number generator fails to function correctly, in which
// case the caller should not continue.
func GenerateRandomBytes(n int) ([]byte, error) {
	b := make([]byte, n)
	_, err := rand.Read(b)
	// Note that err == nil only if we read len(b) bytes.
	if err != nil {
		return nil, err
	}

	return b, nil
}

// GenerateRandomString returns a URL-safe, base64 encoded
// securely generated random string.
// It will return an error if the system's secure random
// number generator fails to function correctly, in which
// case the caller should not continue.
func GenerateRandomString(s int) (string, error) {
	b, err := GenerateRandomBytes(s)
	return base64.URLEncoding.EncodeToString(b), err
}

// don't store the user until we have a credential
// u, e := mg.NewUser(v.Id, v.RecoveryKey)
// if e != nil {
// 	return nil, fmt.Errorf("username already taken")
// }
// r.User = *u

// return a challenge
// if the user already exists because of a failure?
// we can sign the submitted did, that will give us the authority to add the credential

// should this user be shared with other connections?
// currently it is not.
// this requires a unique name
// it can return a session id right away if successfull
// then the client can try to add a device
