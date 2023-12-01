
Dgcashd is a web server for selling datagrove credits.



It probably doesn't make sense to use stripe subscriptions because we need the blinding of a client in order to complete the transaction.

	stripe.Key = os.Getenv("STRIPE_SECRET_KEY")