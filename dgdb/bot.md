
Bots create a datachannel to the Datagrove cluster to allow them to respond to followers: subscribe, query. 

They may also subscribe, but not so much reason initially (down the road this could replace the sftp stuff though).

Users can chat to the bot (shell, ssh gateway), or query it (sftp, psql) over a direct data channel.

There is no multicast datachannel, but the bot can arrange its followers in a tree to allow it to scale announcement style channels. It can announce to Datagrove the leaves, so that it is not innudated with subscribe requests.

Followers that are willing to be followed will get themselves farther up the tree.

