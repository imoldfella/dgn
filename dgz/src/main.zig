const std = @import("std");
const cbor = @import("zbor/main.zig");

extern "onComplete" fn onComplete(id: u32, result: [*]const u8) void;
export fn allocUint8(length: u32) [*]const u8 {
    const slice = std.heap.page_allocator.alloc(u8, length) catch
        @panic("failed to allocate memory");
    return slice.ptr;
}
export fn submit(id: u32, tx: [*]const u8, sz: u64) i8 {
    const allocator = std.heap.page_allocator;
    var str = std.ArrayList(u8).init(allocator);
    defer str.deinit();

    const d: cbor.DataItem = cbor.DataItem.new(tx[0..sz]) catch {
        return -1;
    };
    // why is this failing at runtime?
    const x: Txx = cbor.parse(Txx, d, .{
        .allocator = allocator,
    }) catch {
        return -1;
    };

    const Info = struct {
        versions: []const []const u8,
        sql: []const u8,
    };

    const i = Info{
        .versions = &.{ "FIDO_2_0", "wtf" },
        .sql = x.sql,
    };

    cbor.stringify(i, .{}, str.writer()) catch {
        return -1;
    };

    finish(id, str.items);
    return 0;
}

fn onComplete2(id: u32, result: []const u8) void {
    const stdout = std.io.getStdOut().writer();
    stdout.print("onComplete2", .{}) catch {
        return;
    };
    stdout.print("result: {any},{any}\n", .{ result, id }) catch {
        return;
    };
}

var finish: *const fn (id: u32, result: []const u8) void = onComplete2;

const Txx = struct {
    sql: []const u8,
};

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
    const allocator = std.heap.page_allocator;
    var str = std.ArrayList(u8).init(allocator);
    defer str.deinit();
    finish = onComplete2;
    var tx = Txx{ .sql = "select * from something" };

    cbor.stringify(tx, .{}, str.writer()) catch {
        return;
    };
    const err = submit(0, str.items.ptr, str.items.len);
    const stdout = std.io.getStdOut().writer();
    stdout.print("err: {d}\n", .{err}) catch {
        return;
    };
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
