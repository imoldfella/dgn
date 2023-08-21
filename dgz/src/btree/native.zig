// code for native access to io uring when available, or compatibility layer when not.

const std = @import("std");

const IoUringDiskManager = struct {
    file: std.fs.File,
    io_uring: std.os.linux.IO_Uring,
    // iovec array filled with pointers to buffers from the buffer pool.
    // These are registered with the io_uring and used for reads and writes.
    iovec_buffers: []std.os.iovec,

    // ...
};

const NoUringManager = struct {};
