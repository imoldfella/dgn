

Every tuple is encrypted with a secret key given to readers. The key is regressive, the tuple holds a version that can be used to generate the decryption key from the current key.

Insertions must have an hmac using the writer key (note only writers can confirm this. readers cannot verify the hmac)
Deletions must be signed by a deletion key. (only deleters can confirm this)

The top level name -> label is maintained in certificate transparency logs

pages group tuple with identical secuurity.


Connections are made to coalesce writes and to reduce latency of reads.