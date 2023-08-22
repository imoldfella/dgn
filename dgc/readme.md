
This is both a service and the cli to access that service. Potentially these could be split. The database engine runs in the service (writes are sequenced this way), although the sql compiler runs in the client (easier for error tracking and the like).

dgc schema@server "command"
dgc schema@server -s <file.cmd

dgc start

dgc install

