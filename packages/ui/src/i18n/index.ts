export * from './heroicon'

declare global {
    function $localize (strings: TemplateStringsArray, ...expressions: readonly any[]) :string
}


// function foo(string: TemplateStringsArray, ...expressions: readonly any[]):number {
//     (expressions)
//     return string.length
// }

// function bar() {
//     const a: number = foo`hello ${1} world`
//     console.log( a )
// }