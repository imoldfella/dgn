
import { component$, useSignal, $ } from '@builder.io/qwik';
import { $localize } from '../i18n';
import { Email, H2, Password, Username, blueButton } from '../theme';
import { TextDivider } from '../theme/form';
import { SimplePage } from '../login';
import { Link, link } from '../provider';


export const ContinueWith = component$(() => {
    return <ul class='my-4 space-y-4'>
    <li> <button class={blueButton + ' w-full'}>Continue with Google</button></li>
    <li> <button class={blueButton + ' w-full'}>Continue with Apple</button></li>            
</ul>   
})
export const Signin2 = component$(() => {
    const user = useSignal<string>('')
    const password = useSignal<string>('')
    const submitLogin = $(async () => {
    })
    return <SimplePage>
        <H2 class='whitespace-nowrap'>{$localize`Sign in`}</H2>
        <div>Or, get started for free. <Link class={link} href='/signup'>Sign up</Link></div>
        <ContinueWith />
        <TextDivider>{$localize`or, Sign up with your email`}</TextDivider>
        <form preventdefault:submit method='post' class='mt-2 space-y-4' onSubmit$={submitLogin} >
        <Email autoFocus bind: value={user} />
        <Password bind: value={password} />
        </form>
    </SimplePage>
})

export const Signup = component$(() => {
    const submitLogin = $(async () => {
    })
    const user = useSignal<string>('')
    const password = useSignal<string>('')
    return <SimplePage>
        <H2>{$localize`Create an account`}</H2>
        <div>Or, use existing account. <Link class={link} href='/signin'>Sign in</Link></div>
        <ContinueWith />
        <TextDivider>{$localize`or, Sign up with your email`}</TextDivider>
        <form preventdefault:submit method='post' class='mt-2 space-y-4' onSubmit$={submitLogin} >
        <Email autoFocus bind: value={user} />
        <Password bind: value={password} />
        </form>
    </SimplePage>

})