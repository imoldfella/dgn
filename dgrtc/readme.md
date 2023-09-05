
// identity requires a public key (DID)
// the client will also need to layer on the particular key used to encrypt data so as to be able to store encyrypted on the cluster. this key is different for each database.

do I want a did that can be tracked? why not  a capability per database with no identity? we need an identity for cost tracking purposes anyway? we can force the client to generate a key pair for every database (no tracking). We need this keypair to be able to store the rotated keys.

Can we/should we derive a key based on the database name and some secret? This would let us transfer a single key to a new client device, and still use unique key pairs for each database.

random salt + database name -> sha256 -> seed for eliptical

the database name will need to map to a public key using certificate transparency. Alternately we could use the key directly (as a did). Tor does this but it causes issues.

in dgdb, if we are the only online writer we should then offer to write, as well as cede to any superior writers. Superior writers can be designated.






use one admin keypair to sign id's (these id's are channel specific, not general user ids). 

when we create a channel, we create the keypair that goes with it. 