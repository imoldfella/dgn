/* eslint-disable @typescript-eslint/no-unused-vars */
import {   useContext, useTask$,component$, Slot, HTMLAttributes, useServerData, useSignal } from '@builder.io/qwik'
import { RouterContext, useLocation, useNavigate } from '../provider'
import { isServer } from '@builder.io/qwik/build'
import localeInfo from '../locale'
import { Icon } from '../headless'
import { language } from './heroicon'
import { JSX } from '@builder.io/qwik/jsx-runtime'


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


function serverFormat(key: string|number, ...args: any[]) :  string{
    const lc = getLocale()
    const [ln,bln]  = lc.split('-')
    const o = localeInfo
    if (o.locale[ln] && o.locale[ln][key]) {
        return fmt(o.locale[ln][key],...args)
    } else if (o.locale[bln] && o.locale[bln][key]) {
        return fmt(o.locale[bln][key],...args)
    } else if (o.locale[o.default] && o.locale[o.default][key]) {
        return fmt(o.locale[o.default][key],...args)
    } else {
        return key.toString()
    }
}
// async version of _ can we overload this or is it better to use a different symbol?
// how can we get a locale context here, we aren't in the tree? we need to look at the route directly, that may not be possible either?
export const __ = async (keys: TemplateStringsArray, ...args: any[]) : Promise<string> => {
    const key = keys.join('∞')
    if (isServer) {
        return serverFormat(key,...args)
    } else{
        return getClientStore().format(keys, ...args)
    }
}

const _ =  (keys: TemplateStringsArray, ...args: any[]) : string => {
    const key = keys.join('∞')
    if (isServer) {
        // on server everything is loaded, so just look it up
        return serverFormat(key,...args)
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

// export const I18n = component$<{id: string}>((props)=>{
//     const s = useSignal("...")
//     if (isServer) {
//         // on server everything is loaded, so just look it up
//         return <>{serverFormat(props.id)}</>
//     } else{
//         // on client we need to be able to await dynamically loading the translation
//         // and potentially we need to partially load the translation.
//         // we need to potentially load the translation (partially or completely) for the language, the backup language, and the default language
//         // synchronously here we must hand back a reactive string that will update when the translation is loaded

//         // looking up the key can be yes/no/unknown. If its unknown we need to hand back a reactive string will update when the translation is loaded.
//         const o = getClientStore().formatMaybe( props.id)
//         if (o!=undefined) {
//             return <>{o}</>
//         }

//         return <>{s.value}</>
//     }
// })

export const I18n = component$<{ id: number | string; params: any[] }>(
    (props) : JSX.Element => {
      const loc = useLocation()
      // console.log(`render i18n ${id} ${lang}`);
  
      useTask$(({ track }) => {
        track(() => props.id);
        track(() => loc.tr);
        if (!loc.tr[id]) {
          console.log(`loading ${id} in ${lang}`);
          // TODO handle string ids
          if (isServer) {
            // server has everything loaded
            ts[id] = globalThis[`server_${lang}`]?.[id];
          } else {
            // client needs to load
            ts[id] = `...loading ${id} for ${lang}`;
            setTimeout(() => (ts[id] = `${id} in ${lang} but loaded`), 1000);
          }
        }
      });
      let tr = ts[id];
      if (params?.length) {
        if (tr && typeof tr === "object") {
          let resolved = tr[params[0]] ?? (tr as any)._;
          while (typeof resolved === "number") resolved = tr[resolved];
          tr =
            resolved ??
            `no translation for id ${id} in lang ${lang} for value ${params[0]}`;
        }
        tr = tr.replace(/\$([\$0-9]+)/g, (_, i) => (i === "$" ? "$" : params[i]));
      }
      return <>{tr}</>;
    }
  );
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

            {Object.keys(localeInfo.locale).map((lnx) => {
                const lnd = languages[lnx]
                return <option selected={lnx == loc.ln} key={lnx} value={lnx}>{lnd.name}</option>
            })}
        </select>
    </div>
    )

})

