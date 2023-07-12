import { component$, Slot, useStore } from '@builder.io/qwik';
import {
  useContext,
  useContextProvider,
  createContextId,
} from '@builder.io/qwik';
import { useLocation } from './router';

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

  useContextProvider(LanguageContext, lang);
  return <Slot />
});

export const useLanguage = () => useContext(LanguageContext);
 
