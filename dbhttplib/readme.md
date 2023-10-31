
uploads need to be authorized into an account (may require a pragmatic limit)
generally this is done with auth headers. each file can be in a directory tied to the account.

what about hmac vs eliptical? This would require a login?
what about totp? we could share a secret with the server.
/login1?totp=&user=pass -> token.

AUTH=token   // dehex, decrypt, validate params
/up?file=user.name&offset=0 
data

