
Dgcashd is a web server for selling datagrove credits.



It probably doesn't make sense to use stripe subscriptions because we need the blinding of a client in order to complete the transaction.

	stripe.Key = os.Getenv("STRIPE_SECRET_KEY")

There are two kinds of login:
1. People who receive money. These are heavily regulated and identity is absolute, some shrouding to outside is possible.
2. People who don't receive money. These should stay anonymous as possible. 

Start with an anonymous account, activate payouts will cause stripe onboarding.

An anonymous account is a keypair.

Can you do anything on dcash