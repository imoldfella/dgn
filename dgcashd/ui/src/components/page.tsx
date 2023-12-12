import { $,createContextId, useContext, component$, useContextProvider, Slot } from "@builder.io/qwik";
import { type JSX } from "@builder.io/qwik/jsx-runtime";
import Icon from "./icon";
import { $localize } from '@angular/localize/init'
import { language } from "./heroicon";
import { DarkButton } from "./dark";
import  CanvasKit from 'canvaskit-wasm'


export interface RouteLocation {
    // (undocumented)
    readonly isNavigating: boolean;
    // (undocumented)
    readonly params: Readonly<Record<string, string>>;
    // (undocumented)
    readonly prevUrl: URL | undefined;
    // (undocumented)
    readonly url: URL;

    ln: string
    lc: string
    dir: 'ltr'|'rtl'|'auto'
    avail: string[]
  }
  
const RouteLocationContext = /*#__PURE__*/ createContextId<RouteLocation>('qc-l');
  
export const usePage = () => useContext(RouteLocationContext);
  
const rtl = ["iw","ar"]
const lnd = (x: string) => rtl.includes(x) ? 'rtl' : 'ltr'

// this should only run on the client, how?
export const useNavigate = $(() => {
  return (e: string) => {
      const p = window.location.pathname.split('/')
      p[1] = e
      window.location.pathname = p.join('/')
  }
})


const getloc = (p: Props) => {
  const ln = p.url.pathname.split('/')
  const lnx = p.avail.includes(ln[1])?ln[1]:p.default
  const loc : RouteLocation = {
      isNavigating: false,
      params: {},
      prevUrl: undefined,
      url: p.url,
      ln: lnx,
      lc: p.defaultlc ?? p.default,
      dir: lnd(lnx),
      avail: []
  }
  return loc
}
export interface Props {
  url: URL
avail: string
default: string
defaultlc?: string
}
export const PageProvider = component$<Props>((params) => {
  const r = getloc(params)
  // we need to set up a visible task so when we do a local navigate, we can update the location
  useContextProvider(RouteLocationContext, r );
  return <Slot />
})
// this won't work because we need to generate the page statically
  // export const PageProvider = component$<Props>((params) => {
  //   const r = useSignal<RouteLocation>(getloc(params))
  //   // we need to set up a visible task so when we do a local navigate, we can update the location
  //   useOnWindow('popstate',
  //       $(()=>{
  //         r.value = getloc({
  //           ... params,
  //           url: new URL(window.location.href)
  //         })
  //       }
  //    ))
  //   useContextProvider(RouteLocationContext, r );
  //   return <Slot />
  // })

  type LanguageMap = {
    [key: string]: { name: string, dir: 'ltr' | 'rtl' | 'auto' }
}
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

// const useNavigate = () => {
//     return (e: string) => {
//         const p = window.location.pathname.split('/')
//         p[1] = e
//         window.location.pathname = p.join('/')
//     }
// }

// this has to work with the router(s)
// unclear if we should use the list of languages from a context or require it to be passed as a prop. 
type Props2 = JSX.IntrinsicElements['select'] 
export const LanguageSelect = component$((props: Props2) => {
    const ln = usePage()
    const nav = useNavigate()

    return (<div class='flex  text-black dark:text-white rounded-md items-center '>
        <label class='block mx-2' for='ln'><Icon svg={language}/></label>
        
        <select
            id='ln'
            value={ln.ln}
            aria-label={$localize`Select language`}
            class='flex-1  rounded-md dark:bg-neutral-900 text-black dark:text-white '
            onInput$={(e: Event,target:any) => {
              const newlang = target.value
              //nav(newlang)
          }}
            {...props}
        >
           
                {wtf.map((lnx) => {
                    const lnd = languages[lnx]
                    return <option key={lnx} value={lnx}>{lnd.name}</option>
                })}
        </select>
    </div>
    )

})


export const SimplePage = component$(() => {
  const ln = usePage()

  return <><div dir={ln.dir} class='px-2 space-x-1 my-2 fixed w-screen flex flex-row items-center'>
      <div><Slot name='top-left' /></div>
      <div class='flex-1 ' />

      <div class='w-48 '><LanguageSelect /></div>
      <DarkButton />
  </div>
      <div class="flex items-center justify-center w-screen h-screen">
          <div class='w-96'>
              <Slot />
          </div>
      </div>
  </>
})