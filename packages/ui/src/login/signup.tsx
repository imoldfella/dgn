
import { component$, useSignal, $, useVisibleTask$, NoSerialize, noSerialize } from '@builder.io/qwik';
import { $localize } from '../i18n';
import { Email, H2, Password, blueButton } from '../theme';
import { TextDivider } from '../theme';

import { Close, SimpleDialog, useApp } from '../dg';
import { link } from '../theme';
import { PasskeyState } from './passkey';
import { Peer, WsChannel } from '../abc';
import { Signin } from './api';


export const ContinueWith = component$(() => {
    const app = useApp()
    return <ul class='my-4 space-y-4'>
        { app.config.oauth.map((o) => {
                return <li key={o.name} > <button class={blueButton + ' w-full'}>Continue with {o.name} </button></li>
            })
        }
        </ul>   
})

// login to basic server,
// export const SigninBasic = component$(() => {
//     // we should include a basic peer with useApp?
//     // you can have more peers, but you probably always need one with whatever is your server (or service worker)
//     const app = useApp()
    
//     const lg = useSignal<NoSerialize<PasskeyState>|null>(null)
//     const error = useSignal<string>("")
//     useVisibleTask$(async () => {
//         // maybe pass these in as signals? with login though we need to access nav. we probably don't with error.
//         console.log("connecting websocket")
//         const ch = await WsChannel.create("wss://localhost.direct:8082/wss")
//         const peer = new Peer(ch)
//         lg.value = noSerialize(new PasskeyState(
//             peer,error,
//             (li: Signin)=>{
//                 app.me.value = li
//             },
//         ))
//         lg.value!.initPasskey().then((li)=>{
//             app.me.value = li
//         })
//     })
//     return <SimpleDialog>
//         <div>{error.value}</div>
//         <H2>{$localize`Sign in`}</H2>
//         <form preventdefault:submit method='post' class='mt-2 space-y-4' >
//         <Email autoFocus />
//         <Password />
//         </form>
//         </SimpleDialog>
// })

export const SigninForm = component$(() => {
        const app = useApp()
    const signin = useSignal(false)
    const lg = useSignal<NoSerialize<PasskeyState>|null>(null)
    const error = useSignal<string>("")
    useVisibleTask$(async () => {
        return // disable for now, need this for passkey
        // maybe pass these in as signals? with login though we need to access nav. we probably don't with error.
        console.log("connecting websocket")
        const ch = await WsChannel.create("wss://localhost.direct:8082/wss")
        const peer = new Peer(ch)
        lg.value = noSerialize(new PasskeyState(
            peer,error,
            (li: Signin)=>{
                app.me.value = li
            },
        ))
        lg.value!.initPasskey().then((li)=>{
            app.me.value = li
        })
    })
    return <SimpleDialog>
        <Close/>
        {/* Sign in */}
        { signin.value && <><H2 class='whitespace-nowrap'>{$localize`Sign in`}</H2>
        <div>Or, get started for free. <button onClick$={()=>{signin.value=false}}class={link}>Sign up</button></div>
        <ContinueWith />
        </> }

        {/* Create Account */}
        { !signin.value &&  <><H2>{$localize`Create an account`}</H2>
        <div>Or, use existing account. <button class={link} onClick$={()=>{
            console.log("wtf?")
            signin.value=true
            }}>Sign in</button></div>
        { app.config.oauth.length > 0 ? <><ContinueWith /></> : null }

        </>}
    </SimpleDialog>
})
function nonSerializable(arg0: PasskeyState): PasskeyState | null {
    throw new Error('Function not implemented.');
}

const EmailSignin = component$(() => {
    const user = useSignal<string>('')
    const password = useSignal<string>('')
    const submitLogin = $(async () => {

    })
    return <><TextDivider>{$localize`or, Sign in with your email`}</TextDivider>
    <form preventdefault:submit method='post' class='mt-2 space-y-4' onSubmit$={submitLogin} >
    <Email autoFocus bind:value={user} />
    <Password bind:value={password} />
    </form>
    </>
})
const  EmailCreate = component$(() => {
    const user = useSignal<string>('')
    const submitLogin = $(async () => {

    })
    return         <><TextDivider>{$localize`Or, Sign up with your email`}</TextDivider>
    <form preventdefault:submit method='post' class='mt-2 space-y-4' onSubmit$={submitLogin} >
    <Email autoFocus bind:value={user} />
    <div>By creating an account, I agree to Datagrove's terms of service and privacy policy.</div>
    <button class={blueButton + ' w-full'}>{$localize`Create account`}</button>
    </form></>
})