import { isServer } from "@builder.io/qwik/build"

export const en: Record<string, string> = {
}
const es = {
    "Sign in": "Iniciar sesión",
}
const iw = {
    "Sign in": "התחברות",
}
export const data: Record<string, Record<string, string>> = { en, es, iw }

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
    