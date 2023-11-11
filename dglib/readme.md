
A very simple log writer, similar to calvin ticket number, but heavily batched and with all redundancy delegated to the storage layer (r2). 

1. Collect a batches of inserts (max time, max records)
2. Write the batches into R2
3. Write the batchid into the tail file. When the tail file gets large enough then update the tail finder file and start a new tail.
3b. Proxies will write their batchid to the leader, which includes them in the batch.




We may encounter large uploads. These we can write into a temp file and then sequence that into the next batch.

The whole thing creates a group commit, and acknowledgment is only returned when it is reliably stored. This can cause the same transaction to be retransmitted, the client is responsible to assign a unique id to every operation. The reader generally doesn't care about executing the same insert twice, but if it does, it must dedupe the inserts.



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


There is one cluster writer. It gathers sorted batches from the proxy servers and writes them into a log according to splinterdb methodology. 

There is a tree for each user, and a tree for public.

Private databases
don't log in the public log, write directly to the current leader (webrtc). The current leader may backup to the cloud (paid) or not. Only public databases are written to the cloud.


Use merkle^2 to claim an id and store a public key.
Use cross_id to sign a proof of email/phone/id association.

