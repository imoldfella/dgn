import { component$, useSignal, useVisibleTask$, $ } from "@builder.io/qwik"
import { JSX } from "@builder.io/qwik/jsx-runtime"

type LabelProps = JSX.IntrinsicElements['label']
export const InputLabel = (props: LabelProps) => {
    return <div><label {...props} class="dark:text-neutral-400 text-neutral-600 block text-sm font-medium leading-6">{props.children}</label></div>
}


type InputProps = JSX.IntrinsicElements['input']

export const Input = component$((props: InputProps & { error?: () => JSX.Element }) => {
    return <><div><input
        {...props}
        value={props.value}
        onInput$={props.onInput$}
        class="block w-full rounded-md border-0 dark:bg-neutral-900 bg-neutral-100 py-1.5  shadow-sm sm:text-sm sm:leading-6 p-2" /></div>

        {props.error && <div class='mt-2'>{props.error}</div>}
    </>
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