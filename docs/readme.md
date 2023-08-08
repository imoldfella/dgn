
Each device maintains an offline-first set of databases, each with a log.

When first connecting to a database, the device uses a remote page store checkpoint over https. It restores any log to bring the checkpoint up to date.

The device writes pages locally to create its own checkpoint.

There is a single writer. Readers use optimistic latches.

# Messaging updates

Each database has a current primary. Datagrove itself serves as a primary for public streams. The primary writes the 


# zig vs rust vs c++

zig - no package manager; maybe this doesn't matter? segfaults per primagen
rust - unsafe code is miserable.

