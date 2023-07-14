import en from './en.json'
import es from './es.json'
import iw from './iw.json'
import { LocaleInfo } from '../i18n'

const localeInfo : LocaleInfo = {
    default: 'en',
    locale: { en, es, iw }
}

export default localeInfo