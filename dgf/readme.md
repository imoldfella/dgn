dbf runs a search service that can be used to read the firehose of data, index it, and serve requests over webrtc from thin clients. One reward for running such a service is acquiring usage data from the people served. This data can be exchanged in the usage marketplace to get money or data from other providers. Also it can be used to keep such information private. Clients can select a search service or will be assigned one randomly based on its performance.

dbf can 

Each entry in the log is a transaction on the database, typically an insert. 

varint unique to the database (unique name is logid.varint)
32 bit op defined by the database (hash)
byte string defined by op (cbor)

There is a schema with each database and operations that act on it.
