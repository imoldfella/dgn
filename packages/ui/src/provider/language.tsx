import { component$, Slot, useStore } from '@builder.io/qwik';
import {
  useContext,
  useContextProvider,
  createContextId,
} from '@builder.io/qwik';
import { useLocation } from './router';
import { isServer } from '@builder.io/qwik/build';

function trl(ln: string,keys: TemplateStringsArray, ...args: any[]) {
  const [key,msg] = keys[0].split(':')
  ;(args)
  const en : Record<string,string>= {
    
  }
  const es = {
    "Sign in": "Iniciar sesión",
  }
  const iw = {
  
  }
  const data : Record<string,Record<string,string>> = { en, es, iw }
  const a : Record<string, string>  = data[ln]??en
  
  return a[key]??en[key]??msg??key
}
declare global {
  let global: any
}

export interface Language {
  ln: string
  lc: string
  dir: 'ltr'|'rtl'|'auto'
  avail: string[]
}
export const LanguageContext = createContextId<Language>(
  'LANGUAGE_CONTEXT'
);

const rtl = ["iw","ar"]
 
export interface Props {
  avail: string
  default: string
  defaultlc?: string
}
export const LanguageProvider =  component$<Props>((props) => {
  const loc = useLocation()
  let ln = loc.url.pathname.split('/')[1]
  if (!ln || !props.avail.includes(ln)) {
    ln = props.default
  }
  if (isServer) {
    global.$localize = (key: TemplateStringsArray, ...args: readonly any[]) => {
      console.log('server',ln, key,args)
      return trl(ln,key,...args)
    }
  } else {
    window.$localize = (key: TemplateStringsArray, ...args: readonly any[]) => {
      return trl(ln,key,...args)
    }
  }
  const lang = useStore<Language>({
    ln: ln,
    lc: props.defaultlc ?? props.default,
    dir: rtl.includes(ln) ? 'rtl' : 'ltr',
    avail: props.avail.split(' '),
  })
  // inline script here to set a global?
  useContextProvider(LanguageContext, lang);
  return <div>
    <div> { "WTF"+JSON.stringify(lang) + Math.random()} </div>
    <Slot />
    </div>
});

export const useLanguage = () => useContext(LanguageContext);
 
