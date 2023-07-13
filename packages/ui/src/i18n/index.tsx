import { useContext } from '@builder.io/qwik'
import { RouterContext } from '../provider'

export * from './heroicon'

let _trx : Record<string,string> = {}

export const useLanguage = () =>  { 
    const tr = useContext(RouterContext)
    _trx = tr.tr
   }
  

// this can't be $ because we can't return a promise?
const _ =  (key: TemplateStringsArray, ...args: any[]) : string => {
    // eslint-disable-next-line qwik/use-method-usage
    //_data[key.join(' ')] = key.join(' ') + args.join('')
    (_trx)
    const str = key.join(' ')  + args.join('') 
    return str
}


export  default _

