

Every tuple is encrypted with a secret key given to readers. The key is regressive, the tuple holds a version that can be used to generate the decryption key from the current key.

Insertions must have an hmac using the writer key (note only writers can confirm this. readers cannot verify the hmac)
Deletions must be signed by a deletion key. (only deleters can confirm this)

The top level name -> label is maintained in certificate transparency logs

pages group tuple with identical secuurity.


Connections are made to coalesce writes and to reduce latency of reads.

how can we handle trees that are shared on groves (retweets)? 
each tree needs a single writer, although grove may aggregate the authority to write to those trees.
a tree may be multiple tables.


Bots

1. Tasks; these are configurations of the bot that repeat on a time schedule 
2. Attach
3. Connect


The local server can be accessed in-process (mobile requires this) or inter-process.
Interprocess will be fastest by using
1. Shared memory 
2. domain sockets.


We could potentially use websocket proxy instead of turn. tradeoffs are not clear though.


you should hit datagrove.com as a guest, no login?

but if you go to someone.datagrove.com, that will be a different client (shared js files though? Cacheably?), and it might require login.


