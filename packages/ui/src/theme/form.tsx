import { HTMLAttributes, Slot, component$, useSignal, useVisibleTask$ } from "@builder.io/qwik"



export type TextDividerProps = HTMLAttributes<HTMLDivElement>
export const TextDivider = component$((props: TextDividerProps) => {
    return <div class={`${props.class} relative mt-4 w-full flex`}>

        <div class="relative flex justify-center text-sm w-full">
            <span class=" px-2 text-gray-500">
                <Slot/>
            </span>
        </div>

    </div>
})

export type ButtonProps = HTMLAttributes<HTMLButtonElement> & { disabled?: boolean }

export const DefaultButton = component$((props: ButtonProps) => {
    const b = useSignal< HTMLButtonElement>()
    // do I need this in qwik?
    useVisibleTask$(() => {
        if (b.value?.autofocus) b.value.focus()
    })
    return <button {...props} ref={b} disabled={props.disabled}  class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-indigo-600 disabled:opacity-50"><Slot/></button>
})