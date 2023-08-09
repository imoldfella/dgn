
import { component$, useSignal, $, Slot } from '@builder.io/qwik';
import { $localize, LanguageSelect, useLocale } from '../i18n';
import { DarkButton, Email, H2, Password, Username, blueButton } from '../theme';
import { TextDivider } from '../theme/form';

import { Link, link } from '../provider';


export const languageBar = component$(() => {
    const ln = useLocale()
    return <div dir={ln.dir} class='px-2 space-x-1 my-2  w-full flex flex-row items-center'>
    <div><Slot name='top-left' /></div>
    <div class='flex-1 ' />
    <div class='w-48 '><LanguageSelect /></div>
    <DarkButton />
</div>
})

export const SimpleDialog = component$(() => {
    return <>
        <div class="flex items-center justify-center w-full h-full p-2">
            <div class='w-96'>
                <Slot />
            </div>
        </div>
    </>
})

export const ContinueWith = component$(() => {
    return <ul class='my-4 space-y-4'>
    <li> <button class={blueButton + ' w-full'}>Continue with Google</button></li>
    <li> <button class={blueButton + ' w-full'}>Continue with Apple</button></li>            
</ul>   
})
export const Signin2 = component$(() => {
    const signin = useSignal(true)
    const user = useSignal<string>('')
    const password = useSignal<string>('')
    const submitLogin = $(async () => {
    })
    return <SimpleDialog>
        { signin.value && <><H2 class='whitespace-nowrap'>{$localize`Sign in`}</H2>
        <div>Or, get started for free. <button onClick$={()=>{signin.value=false}}class={link}>Sign up</button></div>
        <ContinueWith />
        <TextDivider>{$localize`or, Sign up with your email`}</TextDivider>
        <form preventdefault:submit method='post' class='mt-2 space-y-4' onSubmit$={submitLogin} >
        <Email autoFocus bind:value={user} />
        <Password bind:value={password} />
        </form></> }
        { !signin.value &&  <><H2>{$localize`Create an account`}</H2>
        <div>Or, use existing account. <button class={link} onClick$={()=>{signin.value=true}}>Sign in</button></div>
        <ContinueWith />
        <TextDivider>{$localize`or, Sign up with your email`}</TextDivider>
        <form preventdefault:submit method='post' class='mt-2 space-y-4' onSubmit$={submitLogin} >
        <Email autoFocus bind:value={user} />
        <Password bind:value={password} />
        </form></>}
    </SimpleDialog>
})
