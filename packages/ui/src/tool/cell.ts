
// client-side only signals. Always noserialize to qwik

import { NoSerialize, noSerialize } from "@builder.io/qwik"
import { debounce } from "lodash"
// Define the saveLayout function

// Call the debouncedSaveLayout function instead of saveLayout

export class Cellb<T> {
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
        return this._value
    }
}
export type Cell<T> = NoSerialize<Cellb<T>>


export type Cellify<T> = {
    [K in keyof T]: Cell<T[K]>;
  };

export function  make_struct<T>(v: T) : NoSerialize<Cellify<T>> {
    const r : any = {}
    for (const k in v) {
        r[k] = new Cellb(v[k])
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

