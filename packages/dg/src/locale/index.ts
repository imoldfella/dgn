import en from './en.json'
import es from './es.json'
import iw from './iw.json'
import { AllLocales } from '../i18n'

const localeInfo : AllLocales =  { en, es, iw }
export const languages : Record<string,string> = {
    en:  'English',
    es:  'Español',
    iw:  'עברית',
}


export default localeInfo