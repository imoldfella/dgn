const std = @import("std");
const cbor = @import("zbor/cbor.zig");

extern "onComplete" fn onComplete(id: u32, result: [*]const u8) void;

fn onComplete2(id: u32, result: []const u8) void {
    const stdout = std.io.getStdOut().writer();

    try stdout.print("result: {},{}\n", .{ result, id });
}

var finish: fn (id: u32, result: []const u8) void = null;

const Txx = struct {
    sql: []const u8,
};

export fn submit(id: u32, tx: [*]const u8) void {
    const allocator = std.heap.page_allocator;
    var str = std.ArrayList(u8).init(allocator);
    defer str.deinit();

    const d = cbor.DataItem.new(tx);
    const x = try cbor.parse(Txx, d, .{});

    const Info = struct {
        versions: []const []const u8,
        sql: x.sql,
    };

    const i = Info{
        .versions = &.{ "FIDO_2_0", "wtf" },
    };

    try cbor.stringify(i, .{}, str.writer());

    onComplete(id, str.items);
}
// c style api's for portability.

const Db = struct {
    heap: []u8,
    heap_size: usize,
    buffer: []u8,
    size: usize,

    // db is reactive, this callback is invoked with handles of queries that have been invalidated
    invalidate: fn ([]u8) void,
};
const Tx = struct {
    db: *Db,
    buffer: []u8,
    size: usize,
};

// a schema is a set of slices. slices can be used in multiple schemas. a slice can only be leased by one primary at a time. Generally transactions across multiple slices should be avoided for this reason since its easy to deadlock.
const PageHeader = struct {
    schema_id: u32,
    slice_id: u32,
};

// this needs to be callable from javascript, how to send config structures?
pub fn initdb(config: *Db) !void {
    _ = config;
}
pub fn commit(db: *Db, tx: *Tx) !void {
    _ = db;
    _ = tx;
}
// pub fn main() !void {
//     const stdout = std.io.getStdOut().writer();
//     try stdout.print("content-type: text/plain\n\n", .{});
//     try stdout.print("Hello, World!\n", .{});
// }

pub fn main() void {
    finish = onComplete2;
    var tx = Txx{ .sql = "select * from something" };
    submit(0, tx);
}

// pub fn main() !void {
//     // Prints to stderr (it's a shortcut based on `std.io.getStdErr()`)
//     std.debug.print("All your {s} are belong to us.\n", .{"codebase"});

//     // stdout is for the actual output of your application, for example if you
//     // are implementing gzip, then only the compressed bytes should be sent to
//     // stdout, not any debugging messages.
//     const stdout_file = std.io.getStdOut().writer();
//     var bw = std.io.bufferedWriter(stdout_file);
//     const stdout = bw.writer();

//     try stdout.print("Run `zig build test` to run the tests.\n", .{});

//     try bw.flush(); // don't forget to flush!
// }
