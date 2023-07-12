import { $, createContextId, component$, useStore, useContextProvider, Slot, useContext, HTMLAttributes, useVisibleTask$, useServerData } from "@builder.io/qwik";
import { isServer } from '@builder.io/qwik/build';


export interface Location {
  url: string;
}
export const RouterContext = createContextId<Location>(
  'docs.router-context'
);

export const Router2 = component$(() => {
  //const svr = useServerData('url') as string
  const svr = "https://localhost:5173/"
  const routingState = useStore<Location>({
    url: svr,
  });
  useContextProvider(RouterContext, routingState);
  
  useVisibleTask$(() => {
    if (!isServer) {
      routingState.url = window.location.href;
      getWindow()?.addEventListener('popstate', (e) => {
        const path = e.state.page;
        const oldUrl = new URL(routingState.url);
        routingState.url = oldUrl.origin + path
      })
    }
  });
  return <Slot />
});
export const Router = component$(() => {
  const svr = useServerData<string|null>('url') 
  const routingState = useStore<Location>({
    url: svr??"",
  });
  useContextProvider(RouterContext, routingState);
  return <Slot />
})

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

export interface RouteLocation {
  readonly params: Record<string, string>;
  readonly url: URL;
  readonly isNavigating: boolean;
}
export const useLocation = (): RouteLocation => {
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

// export declare interface FunctionComponent<P = Record<string, any>> {
//   (props: P, key: string | null, flags: number, dev?: DevJSX): JSXNode | null;
// }
export type RoutingConfigItem = {
  component: any;
  path: string;
}
export const RouterOutlet = component$<{config: RoutingConfigItem[]}>((props) => {
  const getMatchingConfig = (segments: string[], config: RoutingConfigItem[]): RoutingConfigItem | null => {
    const segmentsMatch = (pathSegments: string[], configItem: RoutingConfigItem): boolean => {
      const configItemSegments = configItem.path.split('/');
      if (configItemSegments.length !== pathSegments.length) {
        return false;
      }
      const matches = pathSegments.filter((segment, index) => {
        return segment === configItemSegments[index] || configItemSegments[index].indexOf(':') === 0
      });
      return matches.length === pathSegments.length;
    }
    return config.find(item => segmentsMatch(segments, item)) || null
  }

  const loc = useLocation();
  const segments = loc.url.pathname.split('/');
  segments.splice(0, 2); // remove empty segment and language
  if (segments.length === 0) {
    return props.config[0].component
  }
  return getMatchingConfig(segments, props.config)?.component
})
