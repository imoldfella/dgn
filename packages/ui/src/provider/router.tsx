import { $, useOnWindow,  createContextId, component$, useStore, useContextProvider, Slot, useContext, HTMLAttributes, useServerData, useTask$, useVisibleTask$ } from "@builder.io/qwik";
import { isServer } from '@builder.io/qwik/build';
import {  translations} from "../locale";


const rtl = ["iw","ar"]
// declare global {  
//   let global: any
// }
 
export interface Location {
  url: string;
  ln: string
  lc: string
  dir: 'ltr'|'rtl'|'auto'
  avail: string[]
  tr: Record<string, string>
}
function setLocation(loc: Location, path: string) {
  loc.ln = path.split('/')[1]
  loc.dir = rtl.includes(loc.ln)?"rtl":"ltr"
  loc.tr = translations[loc.ln]
}
export const RouterContext = createContextId<Location>(
  'docs.router-context'
);

export interface Props {
  avail: string
  default: string
  defaultlc?: string
}
export const Router = component$<Props>((props) => {
  const urlLang = (url: string) => {
    const path = new URL(url).pathname
    return path.split('/')[1]
  }
  const svr = useServerData<string|null>('url') 
  const ln = svr?urlLang(svr):props.default
  const routingState = useStore<Location>({
    url: svr??"",
    ln: ln,
    lc: props.defaultlc??'en',
    dir: rtl.includes(props.default)?"rtl":"ltr",
    avail: props.avail.split(','),
    tr: translations[ln]
  });
  

  if (isServer) {
    global.$localize = (keys: TemplateStringsArray, ...args: readonly any[]) => {
        const [key, msg] = keys[0].split(':')
            ; (args)
        const a: Record<string, string> = translations[routingState.ln] ?? translations[props.default]
        return a[key] ?? translations[props.default][key] ?? msg ?? key
    }
  } 

  useOnWindow('popstate', $((e: Event) => {
    const o = e as PopStateEvent
      console.log('popstate',o.state.page)
      setLocation(routingState, o.state.page as string)
    }))
  useContextProvider(RouterContext, routingState);
  return <Slot />
})

// logout is tricky, we can't get the context from an event handler can we?
// log out of all tabs
export const useNavigate = () => {
  const ctx = useContext(RouterContext)
  return $((loc: string) => {
    const to =  new URL(loc, ctx.url).href
    history.pushState({}, loc, to) // does not cause a popstate.
    setLocation(ctx,loc)
  })
}

type AnchorProps = HTMLAttributes<HTMLAnchorElement>

// link needs to respect the language.
// the language selector needs to respect the rest of the path.
export const Link = component$<AnchorProps&{href:string}>((props) => {
  const loc = useLocation()
  const href = new URL("/" + loc.ln+props.href, loc.url).href
  return <a {...props} href={href} > <Slot /> </a>
})

export interface RouteLocation {
  readonly params: Record<string, string>;
  readonly url: URL;
  readonly isNavigating: boolean;
}
export const useLocation = (): Location => {
  return useContext(RouterContext)
}
export const useLanguage2 = () : (x:string) => string => {
  const ctx = useContext(RouterContext)
  return (x: string) => {
    return ctx.tr[x] ?? x
  }
}

export const useLanguage = () : (x: TemplateStringsArray, ...args: readonly any[]) => string => {
  const ctx = useContext(RouterContext)
  return (keys: TemplateStringsArray, ...args: readonly any[]) => {
    (args);
    const [key, msg] = keys[0].split(':')
    const a: Record<string, string> = ctx.tr
    return a[key] ?? ctx.tr[key] ?? msg ?? key
  }
}
export function getWindow(): Window | undefined {
  if (!isServer) {
    return typeof window === 'object' ? window : undefined
  }
  return undefined;
}

// export declare interface FunctionComponent<P = Record<string, any>> {
//   (props: P, key: string | null, flags: number, dev?: DevJSX): JSXNode | null;
// }
export type RoutingConfigItem = {
  component: any;
  path: string;
}
export const RouterOutlet = component$<{config: RoutingConfigItem[]}>((props) => {
  const getMatchingConfig = (segments: string[], config: RoutingConfigItem[]): RoutingConfigItem | null => {
    const segmentsMatch = (pathSegments: string[], configItem: RoutingConfigItem): boolean => {
      const configItemSegments = configItem.path.split('/');
      if (configItemSegments.length !== pathSegments.length) {
        return false;
      }
      const matches = pathSegments.filter((segment, index) => {
        return segment === configItemSegments[index] || configItemSegments[index].indexOf(':') === 0
      });
      return matches.length === pathSegments.length;
    }
    return config.find(item => segmentsMatch(segments, item)) || null
  }

  const loc = useLocation();
  useTask$(()=>{
    loc.ln
    loc.url
  })
  const segments = new URL(loc.url).pathname.split('/');
  segments.splice(0, 2); // remove empty segment and language
  if (segments.length === 0) {
    return props.config[0].component
  }
  return getMatchingConfig(segments, props.config)?.component
})
 

export interface Theme {
    dark: boolean;
}

export const ThemeContext = createContextId<Theme>(
  'docs.theme-context'
);


// not sure what to do about theme provider if it needs to be global or not.
// we probably do want to impact the body tag, but maybe we don't need to.
// potentially use this as a store for things like listening to the size and deciding media query type things.
// container queries are shipping in everything, so maybe we should avoid that.
export const ThemeProvider =  component$(() => {
    const theme = useStore<Theme>({
        dark: true,
    });
    useContextProvider(ThemeContext, theme);
    useVisibleTask$(() => {
        theme.dark = document.documentElement.classList.contains("dark")
    })
    return <>
    <Slot /> 
    
    </>
    });

export const useTheme = () => useContext(ThemeContext);

// this could fetch languages on demand, then we could trigger a re-render of the page?

function localize(keys: TemplateStringsArray, ...args: readonly any[]) : string {
  (args);
  const [key, msg] = keys[0].split(':')
  const o =  (window.$localize as any).TRANSLATIONS[key] ?? msg ?? key
  console.log('localize', keys, o)
  return o
}

// we need to bootstrap whatever translation is the entry url, otherwise recalcs will go awry.

export const ThemeBootstrap = component$(( ) => {
  const svr = useLocation()
  // how do we tell development mode?
  const code = `if(localStorage.theme==="dark"){
    document.documentElement.classList.add("dark");}
  else if(typeof localStorage.theme==="undefined"){
    if(window.matchMedia("(prefers-color-scheme: dark)").matches){
      document.documentElement.classList.add("dark");}
      localStorage.theme="dark";
    }
    window.$localize = ${localize.toString()}
    window.$localize.TRANSLATIONS = ${JSON.stringify(translations[svr.ln] ?? translations.en)}
    `

  return <script dangerouslySetInnerHTML={code} />
})

/*
if (!isServer) {
    const w = window as any
    w.__ln = 'en'
    w.$localize = (ln: string, keys: TemplateStringsArray, ...args: any[]) =>{
        console.log('translate', ln, keys, args)
        const [key, msg] = keys[0].split(':')
            ; (args)
        const a: Record<string, string> = data[ln] ?? en
        return a[key] ?? en[key] ?? msg ?? key
    }
}
    */


import { Icon } from "../headless";
import { language } from "../i18n";

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
            aria-label={$localize`Select language`}
            class='flex-1  rounded-md dark:bg-neutral-900 text-black dark:text-white '
            onInput$={async (e, target) => {
                const newlang = target.value;
                (window.$localize as any).TRANSLATIONS = translations[newlang]
                const rest = new URL(loc.url).pathname.split('/').slice(2).join('/')
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




/*
    const nav = useNavigate()
    const ln = useLn()

    // change the language has to change the route. It doesn't change the store
    const update = (e: string) => {
        const p = window.location.pathname.split('/')
        p[1] = e
        nav(p.join('/'))
    }

    return (<Select entries={allLn} value={ln().ln} onChange={update}>
        <Icon class='h-6 w-6' path={language} /></Select>)

        */