import { $, useOnWindow, createContextId, component$, useContextProvider, Slot, useContext, useServerData, useStore, useTask$, useSignal } from "@builder.io/qwik";

// with the new approach the top route only becomes the default language.
// we could override it in a lower context.
// why not location as a simple string? what else could we put here?
// qwik city uses an URL, but how since it doesn't serialize?
interface RoutingLocation {
  url: string
}
export const RouterContext = createContextId<RoutingLocation>('RoutingLocation')
export const useLocation = () => useContext(RouterContext)
export const useNavigate = () => {
  const ctx = useContext(RouterContext)
  return $((loc: string, opt: {reload?: boolean}= {} ) => {
    const to = new URL(loc, ctx.url).href
    history.pushState({}, loc, to) // does not cause a popstate.
    if (opt.reload) {
      window.location.reload()
    }
    ctx.url = to
  })
}

export const Router = component$(() => {
  const svr = useServerData<string | null>('url')
  const a = {
    url: svr ?? window.location.href
  }
  const routingState = useStore<RoutingLocation>(a)
  useContextProvider(RouterContext, routingState);

  useOnWindow('popstate', $((e: Event) => {
    const o = e as PopStateEvent
    routingState.url = o.state.page as string
  }))
  return <Slot />
})

export const Link = component$<{ href: string }>((props) => {
  return <a href={props.href}><Slot/></a>
})
// export declare interface FunctionComponent<P = Record<string, any>> {
//   (props: P, key: string | null, flags: number, dev?: DevJSX): JSXNode | null;
// }
export type RoutingConfigItem = {
  component: any;
  path: string;
}
const segmentsMatch = (pathSegments: string[], configItem: RoutingConfigItem): boolean => {
  const configItemSegments = configItem.path.split('/');
  if (configItemSegments.length !== pathSegments.length) {
    return false;
  }
  for (let i = 0; i < configItemSegments.length; i++) {
    if (configItemSegments[i].indexOf(':') !== 0 && pathSegments[i] != configItemSegments[i]) return false
  }
  return true
}

// should we render the document on the client or server? optional? stream? lazy load? say a document is prefix of primary key that maps to a range of keys. what would we do for seo? what would we do for a client? maybe as we become visible we should add an extra block? maybe first/last/cursor? we can't prerender cursor.
// maybe we download just first, and then in the background we start downloading in various orders? service worker?
// so maybe routeLoader is limit 100, and then a visible task starts loading more?
// can we return a stream from the route loader?
// route loader is part of qwik city though? is it ok to require it?

export const RouterOutlet = component$<{ config: RoutingConfigItem[] }>((props) => {
  const loc = useLocation()
  const which = useSignal(0)
  const key = useStore({
    value: 0
  })

  useTask$(async ({ track }) => {
    track(()=> loc.url)
    console.log("RouterOutlet", loc.url)
    key.value = key.value + 1
    const pn = new URL(loc.url).pathname.split('/')
    if (pn.length > 0 && pn[pn.length - 1] === '') pn.pop()
    for (let i = 0; i < props.config.length; i++) {
      const item = props.config[i]
      if (segmentsMatch(pn, item)) {
        console.log("RouterOutlet", item.path, i)
        which.value = i
        return
      }
    }
  })

  return  props.config[which.value].component
})
// {props.config[which.value].component}
export const ThemeBootstrap = component$(() => {
  // how do we tell development mode?
  const code = `if(localStorage.theme==="dark"){
    document.documentElement.classList.add("dark");}
  else if(typeof localStorage.theme==="undefined"){
    if(window.matchMedia("(prefers-color-scheme: dark)").matches){
      document.documentElement.classList.add("dark");}
      localStorage.theme="dark";
    }`
  return <script dangerouslySetInnerHTML={code} />
})


/*
  useTask$(({ track }) => {
    track(()=> loc.url)
    track(() => {
      console.log("RouterOutlet", loc)
      key.value = key.value + 1
      const pn = new URL(loc.url).pathname.split('/')
      pn.shift()
      pn.shift()
      if (pn.length > 0 && pn[pn.length - 1] === '') pn.pop()
      for (let i = 0; i < props.config.length; i++) {
        const item = props.config[i]
        if (segmentsMatch(pn, item)) {
          console.log("RouterOutlet", item.path, i)
          which.value = i
          return
        }
      }
    })
  })*/