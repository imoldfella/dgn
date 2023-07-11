import { Slot, component$, useSignal, useVisibleTask$ } from "@builder.io/qwik"
import { JSX } from "@builder.io/qwik/jsx-runtime"



type TextDividerProps = JSX.IntrinsicElements['div'] 
export const TextDivider = component$((props: TextDividerProps) => {
    return <div class={`${props.class} relative mt-4 w-full`}>
        <div class="absolute inset-0 flex items-center w-full">
            <div class="w-full border-t border-gray-300"></div>
        </div>
        <div class="relative flex justify-center text-sm w-full">
            <span class="bg-white dark:bg-black px-2 text-gray-500">
                <Slot/>
            </span>
        </div>
    </div>
})

type ButtonProps = JSX.IntrinsicElements['button'] 

export const DefaultButton = component$((props: ButtonProps) => {
    const b = useSignal< HTMLButtonElement>()
    // do I need this in qwik?
    useVisibleTask$(() => {
        if (b.value?.autofocus) b.value.focus()
    })
    return <button {...props} ref={b} disabled={props.disabled}  class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-indigo-600 disabled:opacity-50"><Slot/></button>
})