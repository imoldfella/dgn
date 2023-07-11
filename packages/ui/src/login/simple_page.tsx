import { Slot, component$ } from "@builder.io/qwik"
import { Ab, DarkButton, LanguageSelect, useLanguage } from ".."



export const SimplePage = component$(() => {
    const ln = useLanguage()

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