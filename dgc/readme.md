
This is both a service and the cli to access that service. Potentially these could be split. The database engine runs in the service (writes are sequenced this way), although the sql compiler runs in the client (easier for error tracking and the like).

dgc schema@server "command"
dgc schema@server -s <file.cmd

dgc start

dgc install


oauth needs a url to go back to, during development this is different.

What do I need for pat to be able to access?
1. Generate https certificate
2. Pat needs to accept this
3. Generate google api * all auth providers.

Or,
1. Use acme with public server
2. Public server serves the client software (but must allow multiple versions of the software)
3. Google login against the public server
4. Datachannel api to the private server

Problems solved: 
Not every local (IOT) server needs an https certificate, which is hard to get behind firewalls etc.

Problems created:
Now we need a datachannel peer api, we need an extra server running.

