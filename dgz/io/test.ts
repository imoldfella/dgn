
let nextid= 0


window.document.body.onload = function() {
    var env = { env: {} };
    WebAssembly.instantiateStreaming(fetch("game.wasm"), env).then(result => {
        console.log("Loaded the WASM!");

        main(); // begin
    });
};


function main() {
    // initialize io system
    // initialize zigdb; set callback.

    // add transactions to the zig queue

    // 

}