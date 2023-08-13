import { component$ } from "@builder.io/qwik"
import { Dialog } from "../toc"
import { Close, useApp } from "../dg"

import { DarkButton, blueButton } from "../theme"
import { SearchBox } from "../root"
import { LanguageSelect } from "../i18n"
import { Avatar } from "../share"



export const More = component$(() => {
    const me = useApp()

    // do we need to do anything else to refresh?
    //  
    return <Dialog>
        <Close />
        <div class=' flex  items-center'>
            <div class='p-1'><Avatar user={me} /></div>
            <LanguageSelect /><DarkButton /></div>
        <ul>
            <li ><button class={blueButton} onClick$={() => { me.me.value = null }} >Logout</button></li>

        </ul>
    </Dialog>
})