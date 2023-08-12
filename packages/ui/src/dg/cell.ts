
// client-side only signals. Always noserialize to qwik
import { isServer } from "@builder.io/qwik/build";
import { debounce } from "lodash"
import { NoSerialize, noSerialize } from '@builder.io/qwik';
// Define the saveLayout function


// Call the debouncedSaveLayout function instead of saveLayout
let currentListener : undefined|( ()=>void) = undefined;
export class Cell<T>  {
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
}

export type Cellify<T> = NoSerialize<Cellifyb<T>>

export function  make_struct<T>(v: T) :Cellify<T> {
    const r : any = {}
    for (const k in v) {
        r[k] = new Cell(v[k])
    }
    return noSerialize(r)
}

export function load_struct(key: string, def: any)  {
    if (!isServer) {
        const s = localStorage.getItem(key)
        if (s) {
            const ld = JSON.parse(s)
            Object.keys(ld).forEach(k=>{
                const o = def[k] as any
                o.value =ld[k]
            }) 
        }
    }
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