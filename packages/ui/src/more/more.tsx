import { component$ } from "@builder.io/qwik"
import { Dialog } from "../toc"
import { Close } from "../tool"
import { useSignin } from "../provider"
import { blueButton } from "../theme"



export const More = component$(() => {
    const me = useSignin()

    // do we need to do anything else to refresh?
    //  
    return <Dialog>
        <Close/>
        <ul>
            <li ><button class={blueButton} onClick$={()=> { me.value = null }} >Logout</button></li>

        </ul>
        </Dialog>
})