
// client-side only signals. Always noserialize to qwik

import { NoSerialize, noSerialize } from "@builder.io/qwik"
import { debounce } from "lodash"
// Define the saveLayout function

// Call the debouncedSaveLayout function instead of saveLayout
let currentListener : undefined|( ()=>void) = undefined;
export class Cell<T> {
    __no_serialize__ = true
    listeners = new Set<()=>void>()
    _value: T
    constructor(v: T) {
        this._value = v
    }
    set value(v: T) {
        this._value = v
        this.listeners.forEach(l=>l())
    }
    get value() {
        if (currentListener) {
            this.listeners.add(currentListener)
        }
        return this._value
    }
}



export type Cellifyb<T> = {
    [K in keyof T]: Cell<T[K]>;
   
  };
export type Cellify<T> = Cellifyb<T> & {  __no_serialize__: true;}

export function  make_struct<T>(v: T) :Cellify<T> {
    const r : any = {}
    r.__no_serialize__ = true
    for (const k in v) {
        r[k] = new Cell(v[k])
    }
    return r
}

export function load_struct<A>(key: string, def: A) : NoSerialize<Cellify<A>> {
    const s = localStorage.getItem(key)
    if (s) {
        def = JSON.parse(s)
    }
    return noSerialize(make_struct(def))
}

export const save_struct = debounce(
    (key: string, l: any)=> {localStorage.setItem('layout', JSON.stringify(l))}, 1000);



export function createEffect(fn: ()=>void) {
    currentListener = fn
    fn()
    currentListener = undefined
    // run in record mode, so each getter also creates a subscription
}

export function computed<T>(fn: ()=>T) : Cell<T>{
    const wrapper : Array<()=>void> = []
    currentListener = () =>{
        wrapper[0]()
    }
    const o = new Cell<T>(fn())
    currentListener = undefined
    wrapper[0] = ()=>{
        o.value = fn()
    }
    return  o
}