
an SSH proxy that runs over a data channel.
there is only one identifier for the server, but there can be multiple connections and a wild card may be enabled to allow any targeted address.

One datachannel = one ssh channel. While it would be possible to multiplex, there is little incentive to do so since datachannels can't easily be shared between tabs anyway.

