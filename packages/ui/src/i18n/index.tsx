/* eslint-disable @typescript-eslint/no-unused-vars */
import { useContext, $, useTask$, component$, Slot, HTMLAttributes, createContextId, useContextProvider, useStore, useComputed$ } from '@builder.io/qwik'
import { useLocation, useNavigate } from '../provider'
import { isServer } from '@builder.io/qwik/build'
import localeInfo, { languages } from '../locale'
import { Icon } from '../headless'
import { language } from './heroicon'

export * from './heroicon'
interface LocaleContext {
    dir: 'ltr' | 'rtl'
    ln: string
}
export type Translation = string | { [key: number]: string }
export type LocaleInfo = Record<string, Translation>
export type AllLocales = Record<string, LocaleInfo>

export const LocaleContext = createContextId<LocaleContext>(
    'LOCALE'
);
export const useLocale = () => {
    return useContext(LocaleContext)
}

// designed to be under a router?
const rtl = ["iw", "ar"]
export const LocaleProvider = component$<{}>((props) => {
    const loc = useLocation()
    const lc = useStore<LocaleContext>({
        dir: 'ltr',
        ln: 'en',
    })
    useContextProvider(LocaleContext, lc);
    useTask$(({ track }) => {
        track(() => {
            let ln = new URL(loc.url).pathname.split('/')[1]
            if (!languages[ln]) {
                ln = 'en'
            }
            lc.dir = rtl.includes(ln) ? "rtl" : "ltr"
            lc.ln = ln;
            (globalThis as any).__LOCALE = ln
            console.log("LocaleProvider",ln,loc.url, lc.dir, lc.ln)
        })
    })
    return <Slot />
})

// translations will be Translation[]
// we are going to need the keys anyway? how can we just use indices? when multiple people are using the document, isn't that going to be a problem? Plus we  have ai's chipping in translations. 


export function fmtPlural(tr: Record<number | string, string>, amount: number) {
    // here we look for the right numeric amount; _ is the default
    let v = tr[amount]
    if (!v) return fmt(tr["_"], amount)
    while (typeof v === "number") v = tr[v]
    return fmt(v, amount)
}
function fmt(tr: string | Record<number | string, string>, ...params: any[]): string {
    console.log("fmt", tr,params?.length)
    return tr.toString()
    // if (typeof tr === "object") {
    //     return fmtPlural(tr, params[0])
    // }
    // if (params?.length) {
    //     tr = tr.replace(/\$([$0-9]+)/g, (_, i) => (i === "$" ? "$" : params[i]));
    //     return tr
    // }
    // return tr
}
const fmt2 = (keys: ReadonlyArray<string>, ...args: any[]) => {
    let s = keys[0]
    for (let i = 0; i < args.length; i++) {
        s += args[i] + keys[i + 1]
    }
    return s
}

// for our purposes translations with integers is going to be painful since distributed mode is the rule. merging the numbers seems unnecessarily painful?
// most transations would be key->translation   // translation has parameters like $0 $1
// but some would be key-> {number: translation}


// should this be a stack? this seems fragile but we need a way outside the use* functions
function getLocale(): string {
    return (globalThis as any).__LOCALE ?? 'en'
}


// this is just held on global window, not a real provider 
// not sure yet how to best do containers, this needs a map of containers to stores
// I need to figure out what container I'm in though.
export class LocaleStore {
    format(key: string, ...args: any[]): string {
        const lcv = getLocale()
        const lc: LocaleInfo = localeInfo[lcv]
        const tr = lc[key]
        if (tr) {
            return fmt(tr, ...args)
        }
        return fmt(key, ...args)
    }
}
function getClientStore(): LocaleStore {
    let o = (window as any).__LOCALESTORE
    if (!o) {
        o = new LocaleStore();
        (window as any).__LOCALESTORE = o
    }
    return o
}

// note that this should not be all or nothing, we eventually want to be able to load the translations incrementally



// maybe this should allow async as well? will our database be fast enough to do looks up like this directly against the database? will it overload a service worker?
// with the new system maybe spread them into a full dictionary for each language?
function serverFormat(key: string, ...args: any[]): string {
    return format( localeInfo[getLocale()],key , ...args)
}
export function format(lc: LocaleInfo, key: string, ...args: any[]): string {
    const tr = lc[key]
    if (tr) {
        return fmt(tr, ...args)
    } else {
        return fmt(key, ...args)
    }
}
export const L = component$((props: {id: string})=> {
    const lc = useLocale()
    const s = useComputed$(() => {
        return format(localeInfo[lc.ln], props.id)
    })
    return <>{s.value}</>
})



// async version of _ can we overload this or is it better to use a different symbol?
// how can we get a locale context here, we aren't in the tree? we need to look at the route directly, that may not be possible either?
export const __ = async (keys: TemplateStringsArray, ...args: any[]): Promise<string> => {
    const key = keys.join('∞')
    if (isServer) {
        return serverFormat(key, ...args)
    } else {
        return getClientStore().format(key, ...args)
    }
}

const _ = (keys: TemplateStringsArray, ...args: any[]): string => {
   
    const key = keys.join('∞')
    console.log("_", key, args)
    if (isServer) {
        // on server everything is loaded, so just look it up
        return serverFormat(key, ...args)
    } else {
        const o = getClientStore().format(key, ...args)
        if (o != undefined) {
            return o
        }
        return "..."
    }
}

export default _


// in development we have to trigger a load translations.
export type SelectProps = HTMLAttributes<HTMLSelectElement>
export const LanguageSelect = component$((props: SelectProps) => {
    const ln = useLocale()
    const loc = useLocation()
    const nav = useNavigate()
    return (<div class={`flex  text-black dark:text-white rounded-md items-center ${props.class}`}>
        <label class='block mx-2' for='ln'><Icon svg={language} /></label>
        <select {...props}
            id='ln'
            aria-label={_`Select language`}
            class='flex-1  rounded-md dark:bg-neutral-900 text-black dark:text-white '
            onInput$={async (e, target) => {
                const newlang = target.value;
                const rest = new URL(loc.url).pathname.split('/').slice(2).join('/')
                console.log("onInput", newlang, rest)
                nav("/" + newlang + "/" + rest, {reload: true})
            }}       
        >

            {Object.keys(languages).map((lnx) => {
                const lnd = languages[lnx]
                return <option selected={lnx == ln.ln} key={lnx} value={lnx}>{lnd}</option>
            })}
        </select>
    </div>
    )
})

export function $localize(strings: TemplateStringsArray, ...params: any[]): string {
    return _(strings, ...params)
}