
Dgdb is a database designed to work primarily over webrtc. It uses a deterministic write ahead log. A central cluster provides a lease for a location/cluster to act as the single writer.

Clients can be PWA's or native applications. Note that webrtc does not support workers; a tab is elected to be the master.



