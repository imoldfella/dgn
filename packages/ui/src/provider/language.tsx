import { component$, Slot, useStore } from '@builder.io/qwik';
import {
  useContext,
  useContextProvider,
  createContextId,
} from '@builder.io/qwik';
import { useLocation } from './router';
import { loadTranslations } from "@angular/localize";

import EN from "../locale/message.en.json";
import IW from "../locale/message.iw.json";
import ES from "../locale/message.es.json";

interface Translation {
  locale: string
  translations: Record<string,string>
}
const translations : Record<string,Translation> = {
  "en": EN as Translation,
  "iw": IW as Translation,
  "es": ES as Translation,
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
  const lang = useStore<Language>({
    ln: ln,
    lc: props.defaultlc ?? props.default,
    dir: rtl.includes(ln) ? 'rtl' : 'ltr',
    avail: props.avail.split(' '),
  })

  loadTranslations(translations[ln].translations )
  useContextProvider(LanguageContext, lang);
  return <Slot />
});

export const useLanguage = () => useContext(LanguageContext);
 
