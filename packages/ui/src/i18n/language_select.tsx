import { HTMLAttributes, component$, useVisibleTask$ } from "@builder.io/qwik";
import { useLanguage } from "../provider";

import { language } from "./heroicon";
import { Icon } from "../headless";
import { useNavigate } from "../provider/router";


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

type Props = HTMLAttributes<HTMLSelectElement>
export const LanguageSelect = component$((props: Props) => {
    const nav = useNavigate()
    const ln = useLanguage()
    useVisibleTask$(()=>{
        console.log('ln', ln)
    })
    return (<div class='flex  text-black dark:text-white rounded-md items-center '>
        <label class='block mx-2' for='ln'><Icon svg={language}/></label>
        <select
            id='ln'
            aria-label={$localize`Select language`}
            class='flex-1  rounded-md dark:bg-neutral-900 text-black dark:text-white '
            onInput$={(e, target) => {
                const newlang = target.value
                nav(newlang)
            }}
            {...props}
        >
           
                {wtf.map((lnx) => {
                    const lnd = languages[lnx]
                    return <option selected={lnx==ln.ln} key={lnx} value={lnx}>{lnd.name}</option>
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