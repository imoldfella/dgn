import { $, createContextId, component$, useStore, useContextProvider, Slot, useContext, HTMLAttributes, useVisibleTask$, FunctionComponent } from "@builder.io/qwik";
import { LoginContext } from "./login";



export interface Location {
    url: URL;
}
// this is initalized by loading the login page.


export const RouterContext = createContextId<Location>(
  'docs.router-context'
);

export const Router =  component$(() => {
    const theme = useStore<Location>({
        url: new URL("https://localhost:5173/")
    });
    useContextProvider(RouterContext, theme);
    return <Slot /> 
    });
    
export const useLogin = () => useContext(LoginContext);

// logout is tricky, we can't get the context from an event handler can we?
// log out of all tabs
export const useNavigate = () => {
  return $((loc: string) => {
    history.pushState({}, '', loc);
  })
}

type AnchorProps = HTMLAttributes<HTMLAnchorElement>

export const Link = component$<AnchorProps>((props) => {
  return <a {...props} > <Slot /> </a>
})

export const useLocation = () => {
  return useContext(RouterContext)
}

const routes : Record<string, FunctionComponent> = {
  '/': () => <div>home</div>,
  '/login': () => <div>login</div>,
  
}

// export declare interface FunctionComponent<P = Record<string, any>> {
//   (props: P, key: string | null, flags: number, dev?: DevJSX): JSXNode | null;
// }
export const RouterOutlet = component$(
  () => {
      const routingState = useContext(ROUTING);
      useVisibleTask$(() => {
          listenToRouteChanges(routingState);
      });
      return routes[routingState.route]();
  }
);
