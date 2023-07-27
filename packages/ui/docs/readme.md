

Our fork of lexical supports multiple buffers in multiple tabs synced to a single vdom accessed through a shared worker.

Databases use Row Level Security (RLS). Each tuple is assigned a label. Each role is granted read/write to that label.

Each tuple can be considered as a log, and each update to the tuple a 3-way merge. The tuple update carries the version of the tuple it modifies. Any server can then first create the new update and deterministically merge from the previous snapshot.

Servers may service online clients using SSR. If there are are no servers online, the client falls back to serving itself. If the client is configured for offline access, then it also will serve itself.

Tor = websockets, Not-tor = datachannel.





