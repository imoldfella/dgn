
Go Services
dglobby - webrtc matchmaking.
dgf - firehose service. Reads the firehose, indexes the records, serves query requests over webrtc. Local webservice provides a simple dashboard.
dglog - accepts writes from clients, authenticates them, then stores them in R2. 

Cli
dgh - general utility, useful for testing.

Static websites
dgchat - static website, javascript client for dglog and dgf






The javascript client can be hosted on any static site, like cloudflare pages.

The dart client is for native.



revokes could use a transparency log; key->revoketime or just key. Here we need to know that the server has recorded the revoke. we need the server to prove there is no revoke. (can merkle^2 do this?)

For the main data log we can have a hash chain, and then record the epoch hash in the transparency log. There is no lookup here, by design you read the entire log.

Is there a way though to allow the firehose readers to prove that they did not equivocate? Should they build 