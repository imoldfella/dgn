package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path"
	"strconv"

	"github.com/joho/godotenv"
	"github.com/stripe/stripe-go/v76"
	"github.com/stripe/stripe-go/v76/checkout/session"

	// "github.com/stripe/stripe-go/v76/customer"
	// "github.com/stripe/stripe-go/v76/paymentintent"
	"github.com/stripe/stripe-go/v76/price"
	"github.com/stripe/stripe-go/webhook"
	"github.com/tailscale/hujson"
)

type Config struct {
	Https []struct {
		Port string `json:"port,omitempty"`
	}
}
type App struct {
	Dir string
	Config
}

var app App

func startup(dir string) error {
	app.Dir = dir
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	// For sample support and debugging, not required for production:
	stripe.SetAppInfo(&stripe.AppInfo{
		Name:    "stripe-samples/checkout-one-time-payments",
		Version: "0.0.1",
		URL:     "https://github.com/stripe-samples/checkout-one-time-payments",
	})

	http.Handle("/", http.FileServer(http.Dir(os.Getenv("STATIC_DIR"))))
	http.HandleFunc("/config", handleConfig)
	http.HandleFunc("/checkout-session", handleCheckoutSession)
	http.HandleFunc("/create-checkout-session", handleCreateCheckoutSession)
	http.HandleFunc("/webhook", handleWebhook)

	b, e := os.ReadFile(path.Join(app.Dir, "index.jsonc"))
	if e != nil {
		return e
	}
	b, e = hujson.Standardize(b)
	if e != nil {
		return e
	}
	e = json.Unmarshal(b, &app.Config)
	if e != nil {
		return e
	}

	http.HandleFunc("/", func(res http.ResponseWriter, req *http.Request) {
		res.Write([]byte("dgcashd 0.1"))
	})

	// do gift cards have sales tax anywhere?
	http.HandleFunc("/cart1", func(res http.ResponseWriter, req *http.Request) {
		amt := req.URL.Query()["amount"]
		if len(amt) == 0 {
			return
		}
		// we should have a
		o, e := strconv.Atoi(amt[0])
		if e != nil {
			return
		}
		_ = o
	})
	http.HandleFunc("/cart", func(res http.ResponseWriter, req *http.Request) {
		amt := req.URL.Query()["amount"]
		if len(amt) == 0 {
			return
		}
		// we should have a
		o, e := strconv.Atoi(amt[0])
		if e != nil {
			return
		}
		_ = o
	})

	// this will be a request from datagrove to spend a coin and apply it to a database.
	http.HandleFunc("/spend", func(res http.ResponseWriter, req *http.Request) {

	})

	log.Printf("listening on %s", app.Config.Https[0].Port)
	return http.ListenAndServe(app.Config.Https[0].Port, nil)

}

// func payIntent() {
// 	params := &stripe.CustomerParams{
// 		Description:      stripe.String("Stripe Developer"),
// 		Email:            stripe.String("gostripe@stripe.com"),
// 		PreferredLocales: stripe.StringSlice([]string{"en", "es"}),
// 	}

// 	c, err := customer.New(params)

// 	// set this so you can easily retry your request in case of a timeout
// 	params.Params.IdempotencyKey = stripe.NewIdempotencyKey()

// 	i := paymentintent.List(params)
// 	for i.Next() {
// 		pi := i.PaymentIntent()
// 	}

// 	if err := i.Err(); err != nil {
// 		// handle
// 	}
// }

// ErrorResponseMessage represents the structure of the error
// object sent in failed responses.
type ErrorResponseMessage struct {
	Message string `json:"message"`
}

// ErrorResponse represents the structure of the error object sent
// in failed responses.
type ErrorResponse struct {
	Error *ErrorResponseMessage `json:"error"`
}

func handleConfig(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, http.StatusText(http.StatusMethodNotAllowed), http.StatusMethodNotAllowed)
		return
	}
	// Fetch a price, use it's unit amount and currency
	p, _ := price.Get(
		os.Getenv("PRICE"),
		nil,
	)
	writeJSON(w, struct {
		PublicKey  string `json:"publicKey"`
		UnitAmount int64  `json:"unitAmount"`
		Currency   string `json:"currency"`
	}{
		PublicKey:  os.Getenv("STRIPE_PUBLISHABLE_KEY"),
		UnitAmount: p.UnitAmount,
		Currency:   string(p.Currency),
	})
}

func handleCheckoutSession(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, http.StatusText(http.StatusMethodNotAllowed), http.StatusMethodNotAllowed)
		return
	}
	sessionID := r.URL.Query().Get("sessionId")
	s, _ := session.Get(sessionID, nil)
	writeJSON(w, s)
}

func handleCreateCheckoutSession(w http.ResponseWriter, r *http.Request) {
	r.ParseForm()
	quantity, err := strconv.ParseInt(r.PostFormValue("quantity")[0:], 10, 64)
	if err != nil {
		http.Error(w, fmt.Sprintf("error parsing quantity %v", err.Error()), http.StatusInternalServerError)
		return
	}
	domainURL := os.Getenv("DOMAIN")

	// Create new Checkout Session for the order
	// Other optional params include:
	// [billing_address_collection] - to display billing address details on the page
	// [customer] - if you have an existing Stripe Customer ID
	// [payment_intent_data] - lets capture the payment later
	// [customer_email] - lets you prefill the email input in the form
	// [automatic_tax] - to automatically calculate sales tax, VAT and GST in the checkout page
	// For full details see https://stripe.com/docs/api/checkout/sessions/create

	// ?session_id={CHECKOUT_SESSION_ID} means the redirect will have the session ID
	// set as a query param
	params := &stripe.CheckoutSessionParams{
		SuccessURL: stripe.String(domainURL + "/success.html?session_id={CHECKOUT_SESSION_ID}"),
		CancelURL:  stripe.String(domainURL + "/canceled.html"),
		Mode:       stripe.String(string(stripe.CheckoutSessionModePayment)),
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{
				Quantity: stripe.Int64(quantity),
				Price:    stripe.String(os.Getenv("PRICE")),
			},
		},
		// AutomaticTax: &stripe.CheckoutSessionAutomaticTaxParams{Enabled: stripe.Bool(true)},
	}
	s, err := session.New(params)
	if err != nil {
		http.Error(w, fmt.Sprintf("error while creating session %v", err.Error()), http.StatusInternalServerError)
		return
	}

	http.Redirect(w, r, s.URL, http.StatusSeeOther)
}

func handleWebhook(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, http.StatusText(http.StatusMethodNotAllowed), http.StatusMethodNotAllowed)
		return
	}
	b, err := ioutil.ReadAll(r.Body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		log.Printf("ioutil.ReadAll: %v", err)
		return
	}

	event, err := webhook.ConstructEvent(b, r.Header.Get("Stripe-Signature"), os.Getenv("STRIPE_WEBHOOK_SECRET"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		log.Printf("webhook.ConstructEvent: %v", err)
		return
	}

	if event.Type == "checkout.session.completed" {
		fmt.Println("Checkout Session completed!")
	}

	writeJSON(w, nil)
}

func writeJSON(w http.ResponseWriter, v interface{}) {
	var buf bytes.Buffer
	if err := json.NewEncoder(&buf).Encode(v); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		log.Printf("json.NewEncoder.Encode: %v", err)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	if _, err := io.Copy(w, &buf); err != nil {
		log.Printf("io.Copy: %v", err)
		return
	}
}

func writeJSONError(w http.ResponseWriter, v interface{}, code int) {
	w.WriteHeader(code)
	writeJSON(w, v)
	return
}

func writeJSONErrorMessage(w http.ResponseWriter, message string, code int) {
	resp := &ErrorResponse{
		Error: &ErrorResponseMessage{
			Message: message,
		},
	}
	writeJSONError(w, resp, code)
}
