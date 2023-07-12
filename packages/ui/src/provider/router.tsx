import { $, useOnWindow,  createContextId, component$, useStore, useContextProvider, Slot, useContext, HTMLAttributes, useServerData, useTask$ } from "@builder.io/qwik";
import { isServer } from '@builder.io/qwik/build';
import { data, en } from "../root2";


const rtl = ["iw","ar"]
declare global {  
  let global: any
}
 
export interface Location {
  url: string;
  ln: string
  lc: string
  dir: 'ltr'|'rtl'|'auto'
  avail: string[]
}
function setLocation(loc: Location, path: string) {
  loc.ln = path.split('/')[1]
  loc.dir = rtl.includes(loc.ln)?"rtl":"ltr"
}
export const RouterContext = createContextId<Location>(
  'docs.router-context'
);

export interface Props {
  avail: string
  default: string
  defaultlc?: string
}
export const Router = component$<Props>((props) => {
  const urlLang = (url: string) => {
    const path = new URL(url).pathname
    return path.split('/')[1]
  }
  const svr = useServerData<string|null>('url') 
  const routingState = useStore<Location>({
    url: svr??"",
    ln: svr?urlLang(svr):props.default,
    lc: props.defaultlc??'en',
    dir: rtl.includes(props.default)?"rtl":"ltr",
    avail: props.avail.split(',')
  });

  if (isServer) {
    global.$localize = (keys: TemplateStringsArray, ...args: readonly any[]) => {
        const [key, msg] = keys[0].split(':')
            ; (args)
        const a: Record<string, string> = data[routingState.ln] ?? en
        return a[key] ?? en[key] ?? msg ?? key
    }
  } 

  useOnWindow('popstate', $((e: Event) => {
    const o = e as PopStateEvent
      console.log('popstate',o.state.page)
      setLocation(routingState, o.state.page as string)
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
    setLocation(ctx,loc)
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
export const useLocation = (): Location => {
  return useContext(RouterContext)

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
  useTask$(()=>{
    loc.ln
    loc.url
  })
  const segments = new URL(loc.url).pathname.split('/');
  segments.splice(0, 2); // remove empty segment and language
  if (segments.length === 0) {
    return props.config[0].component
  }
  return getMatchingConfig(segments, props.config)?.component
})

