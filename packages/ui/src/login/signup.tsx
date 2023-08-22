
import { component$, useSignal, $, Slot } from '@builder.io/qwik';
import { $localize, LanguageSelect, useLocale } from '../i18n';
import { DarkButton, Email, H2, Password, Username, blueButton } from '../theme';
import { TextDivider } from '../theme';

import { Link } from '../provider';
import { Close, SimpleDialog } from '../dg';
import { link } from '../theme';


export const ContinueWith = component$(() => {
    return <ul class='my-4 space-y-4'>
    <li> <button class={blueButton + ' w-full'}>Continue with Google</button></li>
    <li> <button class={blueButton + ' w-full'}>Continue with Apple</button></li>            
</ul>   
})

// login to basic server,
export const SigninBasic = component$(() => {
    return <SimpleDialog>
        <Close/>
        <H2>{$localize`Sign in`}</H2>
        <form preventdefault:submit method='post' class='mt-2 space-y-4' >
        <Email autoFocus />
        <Password />
        </form>
        </SimpleDialog>
})

export const Signin2 = component$(() => {
    const signin = useSignal(true)
    const user = useSignal<string>('')
    const password = useSignal<string>('')
    const submitLogin = $(async () => {
    })
    return <SimpleDialog>
        <Close/>
        { signin.value && <><H2 class='whitespace-nowrap'>{$localize`Sign in`}</H2>
        <div>Or, get started for free. <button onClick$={()=>{signin.value=false}}class={link}>Sign up</button></div>
        <ContinueWith />
        <TextDivider>{$localize`or, Sign in with your email`}</TextDivider>
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
