
Simple lobby for connect webrtc datachannels.

Clients first use whep/whip to create a connection to the lobby.

Use time-limited OTP and OPAQUE to sign up.

Hosts register public keys and prove ownership of corresponding private key. Hosts provide lists of accessor keys, clients receive the corresponding private key to prove. Transparency log gets hash(accessor|host)




