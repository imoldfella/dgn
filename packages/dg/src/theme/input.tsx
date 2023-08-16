import { component$, useSignal, $ } from "@builder.io/qwik"
import type{  QwikIntrinsicElements } from "@builder.io/qwik"
import {$localize} from "../i18n"

export type LabelProps =  QwikIntrinsicElements['label'] & { for: string }
export const InputLabel = (props: LabelProps) => {
    return <div><label {...props} class="dark:text-neutral-400 text-neutral-600 block text-sm font-medium leading-6">{props.children}</label></div>
}


export function OcticonAlertFill12(props: QwikIntrinsicElements['svg'], key: string) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 12 12" {...props} key={key}><path fill="#888888" d="M4.855.708c.5-.896 1.79-.896 2.29 0l4.675 8.351a1.312 1.312 0 0 1-1.146 1.954H1.33A1.313 1.313 0 0 1 .183 9.058ZM7 7V3H5v4Zm-1 3a1 1 0 1 0 0-2a1 1 0 0 0 0 2Z"></path></svg>
    )
  }

export type InputProps =  QwikIntrinsicElements['input'] & { error?: string, onInput$?: (e: Event, target: HTMLInputElement) => void }    

export function Input(props: InputProps)  {
    return <><div><input
        {...props}
        value={props.value}
        onInput$={props.onInput$}
        class="block w-full rounded-md border-0 dark:bg-neutral-900 bg-neutral-100 py-1.5  shadow-sm sm:text-sm sm:leading-6 p-2" /></div>

        {props.error && <div class='mt-2'>{props.error}</div>}
    </>
}
export const Email = component$((props: InputProps) => {
    const prompt = $localize`Email`
    return <div >
        <div class="flex items-center justify-between">
            <InputLabel for="email" >{prompt}</InputLabel>
        </div>
        <div  >
            <Input {...props} placeholder={prompt} id="email" name="email" type="text" autoComplete="username webauthn" />
        </div>
    </div>
})

export const Username = component$((props: InputProps) => {
    const prompt = $localize`Phone, email, or username`
    return <div >
        <div class="flex items-center justify-between">
            <InputLabel for="username" >{prompt}</InputLabel>
        </div>
        <div  >
            <Input {...props} placeholder={prompt} id="username" name="username" type="text" autoComplete="username webauthn" />
        </div>
    </div>
})

export const Password = component$((props: InputProps) => {
    const hide = useSignal(true)
    const el = useSignal<HTMLInputElement>()

    const toggle = $(() => {
        hide.value = (!hide.value)
        if (el.value) {
            if (!hide.value) {
                el.value.type = 'text';
            } else {
                el.value.type = 'password';
            }
        }
    })

    return <div>
        <div class="flex items-center justify-between">
            <InputLabel for="password" >{$localize`Password`}</InputLabel>
            <div class="text-sm">
                <button preventdefault:click tabIndex={-1} onClick$={toggle} class="font-semibold hover:underline  hover:text-indigo-700 dark:text-blue-400 text-blue-700">{hide.value ? $localize`Show password` : $localize`Hide password`}</button>
            </div>
        </div>
        <div >
            <Input {...props} ref={el} id="password" name="password" type={hide.value ? "password" : "text"} autoComplete="current-password" placeholder={$localize`Enter password`} />
        </div>
    </div>
})


/*
    // let's try to focus in the form.
    useVisibleTask$(() => {
        if (props.autoFocus) {
            setTimeout(() => inp.value?.focus())
        }
    })
    */