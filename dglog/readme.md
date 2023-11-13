Database that runs over http. Clients poll the root each second. Designed to play nice with caches like cloudflare.

No interface? Prometheus?

Needs to run on public server with ACME. Caddy would slow it down? what does it take to run multiple servers with one acme certificate though?

Public stream
All records in the public stream can get collected in a single log. The log is a 2 level array; cluster servers first store a batch in the object store, then they store a pointer to the record batch in a meta record. The meta record is rewritten until it is full at regular cadence, when it overflows then we start another record. For convenience we can update a log end pointer when a new meta record starts.

Private stream
Private records are written to another stream. In this case the objects are not in public buckets. Reads must be presigned. 

Each private db is its own two layer array

Each cluster server feed's a subset of private db's. Clients connect directly to the assigned server. A private db generally only allows one feeder, but more can be assigned if scaling is necessary.

We don't need a true 2 level array, instead we have a main log and overflow logs. When an overflow log flushes its record, it introduces a pointer record in the main log. For the common case of only a main and no overflow this eliminates the unneeded redirection.

avoiding dupes/skips is hard over http. but is it worth not using http?

login can give us a session id.

once a 

What if we didn't use a cloud store or only for most recent?

1. Each database starts with a balance paid with tokens ($1?). Users can buy tokens with zcash, then apply them blindly to databases. An auditor can then block writes to a database based on policy.




1. Write tail (xcrash)
2. if the tail is full, update the pointer (xcrash)

when you read the pointer, then read the tail. If the tail is full, write a new pointer.

A goroutine per stream might be too much for private, too little for public?


