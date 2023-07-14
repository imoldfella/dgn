import {  useContext, useTask$ } from '@builder.io/qwik'
import { RouterContext, RouterLocation } from '../provider'
import { isServer } from '@builder.io/qwik/build'

export * from './heroicon'

declare global {
    let _trx: Record<string,Record<string,string>>
}

// on the client we need to assume that things are not loaded, and we may need to set up tracking
export const useLanguage = () =>  { 
    if (isServer) return
    const trx = useContext(RouterContext)
    useTask$(({track}) => {
        track(() => {
            (window as any)._trx = trx.tr[trx.ln]
            console.log("i18n",JSON.stringify(trx))            
        })
    })
}
  
// this can't be $ because we can't return a promise?
const _ =  (key: TemplateStringsArray, ...args: any[]) : string => {
    if (isServer) {
        return key[0]
    }
    const trx = (window as any)._trx??{}
    const s = trx[key[0]]
    const o =  s ?? key[0] + args.join('')
    //console.log("i18n",key[0],o,_ln)
    return o
}

export  default _

