
buffer pool/storage manager


jimhurd@Jims-MBP dgz % zig build-exe -O ReleaseSmall -target wasm32-wasi src/main.zig
jimhurd@Jims-MBP dgz % wasmtime main.wasm

each transaction is either global or locally sequenced. eventually all transactions are globally sequenced. (bayou)

