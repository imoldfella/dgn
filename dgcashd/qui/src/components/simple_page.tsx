import { Slot, component$ } from "@builder.io/qwik"
import {  DarkButton } from "./dark"
import { LanguageSelect } from "./language_select"
import { usePage } from "./location"



export const SimplePage = component$(() => {
    return <Slot/>
})

export const SimplePage2 = component$(() => {
    const ln = usePage()
    return <Slot/>

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