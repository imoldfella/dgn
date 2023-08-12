/* eslint-disable @typescript-eslint/no-unused-vars */

// interface LoginProps2 extends LoginProps {
//     finishLogin: (i: LoginInfo) => void


import { $, useComputed$ } from "@builder.io/qwik"
import { useSignin } from "../provider"
import { component$, noSerialize, useSignal, useStore, useVisibleTask$ } from "@builder.io/qwik"
import { Modal, ModalStore, Password, Username } from "../theme"
import { ClientState } from "./passkey"
import { LoginInfo } from "./api"
import { LoginWith } from "./login_with"
import { DefaultButton, TextDivider } from "../theme/form"
import { useNavigate } from "../provider/router"
import $localize from "../i18n"

// abort controllers are not serializable :(
// we can 

// }
enum Screen {
    Login,  // this is the default screen: user/password + passkey + oauth
    Secret,
    AddKey,
    Suspense
}

// we might go to a different route depending on who the user is and what their state is. how do we pass this kind of call back? Or maybe we don't need it, maybe we just to a /logged in route and redirect from there?

// what about localization for styling? similar idea by using strings for classes. difference is that we only have one "language", that the user can change, but we should be able to use the same post processing to boil away everything to a string.

const LoginForm = component$(() => {

    return <div>Login</div>
})

// here we need an extra code, this should probably be a modal
const GetSecret = component$(() => {
    return <div>Login</div>
})

const AddPasskey = component$(() => {
    return <div>Login</div>
})

interface Props {
    onLogin?: (e: LoginInfo) => void
    oauth?: string[]
}


export default component$(() => {
  const store = useStore<ModalStore>({
    isOpen: false,
  });

  return (
    <div>
      <button onClick$={() => (store.isOpen = true)}>open modal</button>

      <Modal title="test-modal" store={store}>
        <div>Ask for 2nd factor</div>
      </Modal>
    </div>
  );
});

export const SimpleLogin = component$<Props>(({ onLogin, oauth }) => {
    const login = useSignin()
    const user = useSignal<string>('')
    const password = useSignal<string>('')
    const error = useSignal('')
    const navigate = useNavigate()

    const oauthx = useComputed$(() => oauth ?? ['apple','google','facebook','github' ])

    // Second factor dialog
    const factor2 = useStore<ModalStore>({
        isOpen: false,
      });
    const passkeyNag = useStore<ModalStore>({
        isOpen: false,
    })

    const finish = $(() => {
        if (onLogin && login.info) {
            onLogin(login.info)
        } else {
            navigate('/')
        }
    })

    useVisibleTask$(({ track, cleanup }) => {
        // we need a login api. if there is no login api installed we can start the datagrove one.
        track(() => onLogin)
        if (!login.api) {
            throw 'no login api'
        }

        const x = new ClientState(login, finish, (e) => error.value = e)
        login.client = noSerialize(x)
        cleanup(() => {
            login.client?.destroy()
        })
    })
    const submitLogin = $(async () => {
        factor2.isOpen = true
        console.log('opened')
        return

        const [cn, err] = await login.api!.loginpassword(user.value, password.value)
        if (err) {
            error.value = err
        } else if (cn.login_info) {
            login.info = cn.login_info
            // potentially ask if they want to add a passkey
            if (cn.passkey_nag){
                passkeyNag
            } else {
                finish()
            }
        } else {
            // we need another factor
           
            factor2.isOpen = true
            // we should have an await here.
            //const [log, e] = await props.api.loginpassword2(secret)
        }
    })
    return <form preventdefault:submit method='post' class='space-y-6' onSubmit$={submitLogin} >
        <Username autoFocus bind: value={user} />
        <Password bind: value={password} />
        <DefaultButton >{$localize`Sign in`}</DefaultButton>
        <TextDivider>{$localize`Continue with`}</TextDivider>
        {oauthx.value.length && <LoginWith />}
        <Modal title="test-modal" store={factor2}>
            <div>Ask for 2nd factor</div>
        </Modal>
        <Modal title="test-modal" store={factor2}>
            <div>Passkey nag</div>
        </Modal>
    </form>
})


/*
    const Clock = component$<{ isRunning: Signal<boolean> }>(({ isRunning }) => {
        const time = useSignal('paused');
        useVisibleTask$(({ cleanup }) => {
        isRunning.value = true;
        const update = () => (time.value = new Date().toLocaleTimeString());
        const id = setInterval(update, 1000);
        cleanup(() => clearInterval(id));
        });
        return <div>{time}</div>;
    });

    how can I make loginwith cheaper? it's already lazy loaded, but what if we don't want it? Maybe some kind of macro that runs in the rollup pipeline? could it be as simple as a const prop that just boils everything away? how clever is qwik with conditionals? can you ever truly prove that something is not used in javascript?

     return <>
        { screen.value==Screen.Login && <LoginForm/> }
        { screen.value==Screen.Secret && <GetSecret/> }
        { screen.value==Screen.AddKey && <AddPasskey/> }
        { screen.value==Screen.Suspense && <div>loading...</div> }
    </>
    return <div>
 
        <Match when={ screen() == Screen.AddKey }> <AddPasskey onClose={ onCloseAddKey } /></Match >
            <Match when={ screen() == Screen.Secret }> <GetSecret validate={ validate } onClose = { confirmSecret } /> </Match>
                < Match when = { screen() == Screen.Suspense
}>

        < pre class='hidden' > { JSON.stringify(loginInfo(), null, 2) } < /pre>
            < /Match>
            < Match when = { screen() == Screen.Login}>
                <form method='post' class='space-y-6' onSubmit = { submitLogin } >
                    <Show when={ error() }> <div>{ error() } < /div></Show >
                        <Username autofocus onInput = {(e: string) => setUser(e)} />
                            < Password onInput = {(e: string) => setPassword(e)} />
                                <BlueButton> { ln().signin } < /BlueButton>
                                <TextDivider> { ln().continueWith } < /TextDivider>
                                < LoginWith />
                                </form>
                                < div class="hidden mt-4" > <Spc />
                                    < Ab href = '../register' > { ln().ifnew } < /Ab>
                                        < Spc /> </div>
                                        < /Match>
                                        < /Switch>

                                        < /div>
}

*/


