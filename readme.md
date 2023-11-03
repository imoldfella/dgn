
Services
dglobby - webrtc matchmaking.
dgf - firehose service. Reads the firehose, indexes the records, serves query requests over webrtc. Local webservice provides a simple dashboard.
dglog - accepts writes from clients, authenticates them, then stores them in R2. 
dgchat - static website, javascript client for dglog and dgf


Cli
dgh - general utility, useful for testing.



The javascript client can be hosted on any static site, like cloudflare pages.

The dart client is for native.