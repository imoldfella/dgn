import { $, createContextId, component$, useStore, useContextProvider, Slot, useContext, HTMLAttributes, useVisibleTask$ } from "@builder.io/qwik";
import { LoginContext } from "./login";
import {isServer} from '@builder.io/qwik/build';

export interface RouteLocation {
  /**
   * Route params extracted from the URL.
   */
  readonly params: Record<string, string>;
  /**
   * The current URL.
   */
  readonly url: URL;
  /**
   * True if the app is currently navigating.
   */
  readonly isNavigating: boolean;
}
export interface Location {
  url: string;
  segments: string[];
}
// this is initalized by loading the login page.


export const RouterContext = createContextId<Location>(
  'docs.router-context'
);

export const Router =  component$(() => {
    const theme = useStore<Location>({
        url: "https://localhost:5173/",
        segments: [''],
    });
    useContextProvider(RouterContext, theme);
    return <Slot /> 
    });
    

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

export const useLocation = () : RouteLocation => {
  const x = useContext(RouterContext).url
  return {
    params: {},
    url: new URL(x),
    isNavigating: false,
  }
}


export function getWindow(): Window | undefined {
  if (!isServer) {
      return typeof window === 'object' ? window : undefined
  }
  return undefined;
}
export function setRoutingState(path: string, routingState: Location): void {
  const oldUrl = new URL(routingState.url);
  const newUrl = new URL(oldUrl.origin + path);
  const {segments, url} = getRoutingStateByPath(newUrl.toString())
  routingState.segments = segments;
  routingState.url = url;
}
// this will retrieve the routingstate by the path (the current url)
export function getRoutingStateByPath(path: string): Location {
  const url = new URL(path);
  const segments = url.pathname.split('/');
  segments.splice(0, 1);
  return {
      url: path,
      segments: segments
  }
}

// export declare interface FunctionComponent<P = Record<string, any>> {
//   (props: P, key: string | null, flags: number, dev?: DevJSX): JSXNode | null;
// }
export function listenToRouteChanges(routingState: Location): void {
  if (!isServer) {
      // when the navigation buttons are being used
      // we want to set the routing state
      getWindow()?.addEventListener('popstate', (e) => {
          const path = e.state.page;
          setRoutingState(path, routingState);
      })
  }
}

export type RoutingConfigItem = {
  component: any;
  path: string;
}
export type RoutingConfig = RoutingConfigItem[];
export const routingConfig:RoutingConfig = [
  {
      path: '',
      component: <div>home</div>
  },
  {
      path: 'users',
      component: <div>users</div>
  },
  {
      path: 'users/:id',
      component: <div>user</div>
  }
]

export function getMatchingConfig(segments: string[], config: RoutingConfig): RoutingConfigItem|null {
  const found = config.find(item => segmentsMatch(segments, item))
  if (found) {
      return found;
  }
  return null;
}
export function segmentsMatch(pathSegments: string[], configItem: RoutingConfigItem): boolean {
  const configItemSegments = configItem.path.split('/');
  if (configItemSegments.length !== pathSegments.length) {
      return false;
  }
  const matches = pathSegments.filter((segment, index) => {
      return segment === configItemSegments[index] || configItemSegments[index].indexOf(':') === 0
  });
  return matches.length === pathSegments.length;
}

export const RouterOutlet = component$(
  () => {
      const routingState = useContext(RouterContext);
      useVisibleTask$(() => {
          listenToRouteChanges(routingState);
      });
      return getMatchingConfig(routingState.segments, routingConfig)?.component

  }
);
