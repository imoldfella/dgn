import { $, useOnWindow, createContextId, component$, useStore, useContextProvider, Slot, useContext, HTMLAttributes, useServerData } from "@builder.io/qwik";
import { isServer } from '@builder.io/qwik/build';

export interface Location {
  url: string;
}
export const RouterContext = createContextId<Location>(
  'docs.router-context'
);

export const Router = component$(() => {
  const svr = useServerData<string|null>('url') 
  const routingState = useStore<Location>({
    url: svr??"",
  });
  useOnWindow('popstate', $((e: Event) => {
    const o = e as PopStateEvent
      console.log('popstate',o.state.page)
      routingState.url = o.state.page;
    }))
  useContextProvider(RouterContext, routingState);
  return <Slot />
})

// logout is tricky, we can't get the context from an event handler can we?
// log out of all tabs
export const useNavigate = () => {
  const ctx = useContext(RouterContext)
  return $((loc: string) => {
    const to =  new URL(loc, ctx.url).href
    history.pushState({}, loc, to) // does not cause a popstate.
    ctx.url =to
    console.log('pushstate', loc)
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
