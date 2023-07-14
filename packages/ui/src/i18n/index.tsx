/* eslint-disable @typescript-eslint/no-unused-vars */
import {   useContext, useTask$,component$, Slot, HTMLAttributes, useServerData } from '@builder.io/qwik'
import { RouterContext, useLocation, useNavigate } from '../provider'
import { isServer } from '@builder.io/qwik/build'
import localeInfo from '../locale'
import { Icon } from '../headless'
import { language } from './heroicon'
import { get } from 'http'

export * from './heroicon'

// should this be a stack? this seems fragile but we need a way outside the use* functions
function getLocale() : string {
    return (globalThis as any).__LOCALE??'en'
}

// this is just held on global window, not a real provider 
// not sure yet how to best do containers, this needs a map of containers to stores
// I need to figure out what container I'm in though.
export class LocaleStore {
    async  format( keys: TemplateStringsArray, ...args: any[]) : Promise<string> {
        const locale = getLocale()
        console.log("format",locale,keys,args)
        const o = localeInfo
        const key = keys.join('∞')
        const [ln,bln]  = getLocale().split('-')
        if (o.locale[ln] && o.locale[ln][key]) {
            return fmt(o.locale[ln][key],...args)
        } else if (o.locale[bln] && o.locale[bln][key]) {
            return fmt(o.locale[bln][key],...args)
        } else if (o.locale[o.default] && o.locale[o.default][key]) {
            return fmt(o.locale[o.default][key],...args)
        } else {
            return fmt(keys)
        }
    }

    formatMaybe( keys: TemplateStringsArray, ...args: any[]) : string | undefined {
        const locale = getLocale()
        console.log("formatMaybe",locale,keys,args)
        const o = localeInfo
        const key = keys.join('∞')
        const [ln,bln]  = getLocale().split('-')
        if (o.locale[ln] && o.locale[ln][key]) {
            return fmt(o.locale[ln][key],...args)
        } else if (o.locale[bln] && o.locale[bln][key]) {
            return fmt(o.locale[bln][key],...args)
        } else if (o.locale[o.default] && o.locale[o.default][key]) {
            return fmt(o.locale[o.default][key],...args)
        } else {
            return fmt(keys)
        }
    }
}
function getClientStore() {
    let o =  (window as any).__LOCALESTORE
    if (!o) {
        o = new LocaleStore();
        (window as any).__LOCALESTORE = o
    }
    return o
}

// note that this should not be all or nothing, we eventually want to be able to load the translations incrementally

export interface LocaleInfo {
    default: string
    // maps 
    locale: Record<string, Record<string, ReadonlyArray<string>>>
}
const fmt = (keys: ReadonlyArray<string>, ...args: any[]) => {
    let s = keys[0]
    for (let i=0; i< args.length; i++) {
        s += args[i] + keys[i+1]
    }
    return s
}

// interface LocaleContext {
//     ln: string
//     tr: Record<string,Record<string,string>>
// }
// export const LocaleContext = createContextId<LocaleContext>(
//     'LOCALE'
//   );
// on the client we need to assume that things are not loaded, and we may need to set up tracking
export const useLanguage = () =>  { 
    const trx = useContext(RouterContext)
    useTask$(({track}) => {
        track(() => {
            if (!isServer)
              (window as any).__LOCALE = trx.ln
      
            console.log("i18n",JSON.stringify(trx))            
        })
    })
}
  
// somehow on the client this needs to return a string proxy that will let us change the value in the dom directly. then when the language changes we can update the dom

function serverFormat(keys: TemplateStringsArray, ...args: any[]) :  string{
    const lc = getLocale()
    const key = keys.join('∞')
    const [ln,bln]  = lc.split('-')
    const o = localeInfo
    if (o.locale[ln] && o.locale[ln][key]) {
        return fmt(o.locale[ln][key],...args)
    } else if (o.locale[bln] && o.locale[bln][key]) {
        return fmt(o.locale[bln][key],...args)
    } else if (o.locale[o.default] && o.locale[o.default][key]) {
        return fmt(o.locale[o.default][key],...args)
    } else {
        return fmt(keys)
    }
}
// async version of _ can we overload this or is it better to use a different symbol?
// how can we get a locale context here, we aren't in the tree? we need to look at the route directly, that may not be possible either?
export const __ = async (keys: TemplateStringsArray, ...args: any[]) : Promise<string> => {
    if (isServer) {
        return serverFormat(keys,...args)
    } else{
        return getClientStore().format(keys, ...args)
    }
}

const _ =  (keys: TemplateStringsArray, ...args: any[]) : string => {
    if (isServer) {
        // on server everything is loaded, so just look it up
        return serverFormat(keys,...args)
    } else{
        // on client we need to be able to await dynamically loading the translation
        // and potentially we need to partially load the translation.
        // we need to potentially load the translation (partially or completely) for the language, the backup language, and the default language
        // synchronously here we must hand back a reactive string that will update when the translation is loaded

        // looking up the key can be yes/no/unknown. If its unknown we need to hand back a reactive string will update when the translation is loaded.
        const o = getClientStore().formatMaybe( keys, ...args)
        if (o!=undefined) {
            return o
        }
        return "..."
    }
}

export  default _



type LanguageMap = {
    [key: string]: { name: string, dir: 'ltr' | 'rtl' | 'auto' }
}
// this data needs to be kept even when translations are inlined.
const languages: LanguageMap = {
    en: {
        name: 'English',
        dir: 'ltr',
    },
    es: {
        name: 'Español',
        dir: 'ltr',
    },
    iw: {
        name: 'עברית',
        dir: 'rtl',
    }
}
const wtf = ['en', 'es', 'iw']


// in development we have to trigger a load translations.
export type SelectProps = HTMLAttributes<HTMLSelectElement>
export const LanguageSelect = component$((props: SelectProps) => {
    const loc = useLocation()
    const nav = useNavigate()
    return (<div class='flex  text-black dark:text-white rounded-md items-center '>
        <label class='block mx-2' for='ln'><Icon svg={language()} /></label>
        <select
            id='ln'
            aria-label={_`Select language`}
            class='flex-1  rounded-md dark:bg-neutral-900 text-black dark:text-white '
            onInput$={async (e, target) => {
                
                const newlang = target.value;
                const rest = new URL(loc.url).pathname.split('/').slice(2).join('/')
                console.log("onInput", newlang, rest)
                nav("/" + newlang + "/" + rest)
            }}
            {...props}
        >

            {wtf.map((lnx) => {
                const lnd = languages[lnx]
                return <option selected={lnx == loc.ln} key={lnx} value={lnx}>{lnd.name}</option>
            })}
        </select>
    </div>
    )

})