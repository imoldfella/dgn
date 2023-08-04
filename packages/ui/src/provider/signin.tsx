import { component$, Slot, useStore, NoSerialize, useVisibleTask$, useSignal, Signal } from '@builder.io/qwik';
import {
  useContext,
  useContextProvider,
  createContextId,
} from '@builder.io/qwik';
import {  LoginApi, Signin, testUser } from '../login/api';
import { ClientState } from '../login/passkey';
import { useNavigate } from './router';




export const SigninContext = createContextId<Signal<Signin|null>>(
  'docs.login-context'
);
export const useSignin = () => useContext(SigninContext);

// note that this is always generated as not signed in, because of the useVisibleTask
export const SigninProvider =  component$(() => {

  const login = useSignal<Signin|null>(null);

    useVisibleTask$(() => {
      const e  = JSON.parse(localStorage.getItem("login")??'null')
      login.value = e
      addEventListener('storage', (e) => {
        if (e.key === "login") {
          const o = JSON.parse(e.newValue??'null')
          login.value = o
        }
      })
    })


    useContextProvider(SigninContext, login);
    return <Slot />
    })
    





// logout is tricky, we can't get the context from an event handler can we?
// log out of all tabs
export const useLogout = () => {
  const navigate = useNavigate()
  return () => {
    sessionStorage.removeItem('token');
    navigate('/');
  }
}


