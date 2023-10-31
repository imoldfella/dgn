
uploads need to be authorized into an account (may require a pragmatic limit)
generally this is done with auth headers. each file can be in a directory tied to the account.

what about hmac vs eliptical? This would require a login?
what about totp? we could share a secret with the server.

Instead we can keep only public keys on the server (can't be stolen).
We can read the root to get a challenge, or we can simply use a not-too-old time and send the time with the login.

/login1?time=&pk=&sign=
-> token.

AUTH=token   // dehex, decrypt, validate params
/up?file=user.name&offset=0 
data

