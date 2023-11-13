Private databases are quite different from public ones.

A writer is selected from the available servers, and given a lease. The writer uses presigned urls to write pages, it sends its recovery log to a shared (but encrypted) cloud log. This sharing should allow lower latency and lower cost. The log should be rarely read.

