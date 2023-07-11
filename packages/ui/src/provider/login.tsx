import { component$, Slot, useStore, NoSerialize } from '@builder.io/qwik';
import {
  useContext,
  useContextProvider,
  createContextId,
} from '@builder.io/qwik';
import {  LoginApi, LoginInfo } from '../login/api';
import { ClientState } from '../login/passkey';
import { useNavigate } from './router';


 
export interface Login {
    info?: LoginInfo
    alt?: LoginInfo[]

    api?: NoSerialize<LoginApi>
    client?: NoSerialize<ClientState>
}
// this is initalized by loading the login page.


export const LoginContext = createContextId<Login>(
  'docs.login-context'
);

export const LoginProvider =  component$(() => {
    const login = useStore<Login>({});
    useContextProvider(LoginContext, login);
    return <Slot />
    })
    
export const useLogin = () => useContext(LoginContext);




// logout is tricky, we can't get the context from an event handler can we?
// log out of all tabs
export const useLogout = () => {
  const navigate = useNavigate()
  return () => {
    sessionStorage.removeItem('token');
    navigate('/');
  }
}


