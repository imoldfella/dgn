import { $, createContextId, component$, useStore, useContextProvider, Slot, useContext, HTMLAttributes, useVisibleTask$ } from "@builder.io/qwik";
import { isServer } from '@builder.io/qwik/build';


export interface Location {
  url: string;
}
export const RouterContext = createContextId<Location>(
  'docs.router-context'
);

export const Router = component$(() => {
  const routingState = useStore<Location>({
    url: '',
  });
  useContextProvider(RouterContext, routingState);
  
  useVisibleTask$(() => {
    if (!isServer) {
      // when the navigation buttons are being used
      // we want to set the routing state
      routingState.url = window.location.href;
      getWindow()?.addEventListener('popstate', (e) => {
        const path = e.state.page;
        const oldUrl = new URL(routingState.url);
        const newUrl = new URL(oldUrl.origin + path);

        // this will retrieve the routingstate by the path (the current url)
        const getRoutingStateByPath = (path: string): Location => {
          const url = new URL(path);
          const segments = url.pathname.split('/');
          segments.splice(0, 1);
          return {
            url: path,
          }
        }
        const { url } = getRoutingStateByPath(newUrl.toString())
        routingState.url = url;
      })
    }
  });
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

export interface RouteLocation {
  readonly params: Record<string, string>;
  readonly url: URL;
  readonly isNavigating: boolean;
}
export const useLocation = (): RouteLocation => {
  //const x = useContext(RouterContext).url
  return {
    params: {},
    url: new URL("https://localhost:5173/users"),
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
export const RouterOutlet = component$(() => {
  type RoutingConfig = RoutingConfigItem[];
  const routingConfig: RoutingConfig = [
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

  const getMatchingConfig = (segments: string[], config: RoutingConfig): RoutingConfigItem | null => {
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

  const url = useContext(RouterContext).url;
  const segments = url.split('/');
  segments.splice(0, 1); // remove empty segment 
  return getMatchingConfig(segments, routingConfig)?.component
}
);
