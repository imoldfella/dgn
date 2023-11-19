
1. Push capability. This requires an always on, always trusted writer.
2. Global capability; twitter packs integers, then globally looks them up.
3. public vs private. private=payment. public=teaching.


Poll root every second; If this shows no change than we are done.

we need a global proof state? how do we check revokes?

https://escholarship.org/content/qt8wm711vp/qt8wm711vp.pdf

create a note random
blind the note
pay for signature
unblind the note
send unblinded note as payment.


we could have the server sign (intid,pk) pairing, what does that accomplish?

(dbid,clientid,clientlsn,value)  #clientlsn redundant? could be used for idempotency.

What trust do we place in the server in this case?

Each client knows their id and their log. It could periodically sign an epoch hash and upload it so that auditors can compute that all the records have been integrated into the log.

Auditors checking for idempotency is potentially expensive. But the server checking for idempotency is also potentially expensive. checking on the server would allow minute storage savings.

Each token could have the clientid and the dbid, and these would be created from the proof at login.

A proof is a path through a grant graph. Keys grant to other keys, rooted at a host key.

