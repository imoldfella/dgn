
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


Each cluster member has a set of slots. It continues to gather those slots and insert them into the trees.
OR
why not just let each computer insert the records as it gathers them? We still need to create an epoch each second though so that clients can poll it? what is the scalestore approach to MVCC?

There is a tree for each user, and a tree for public.

