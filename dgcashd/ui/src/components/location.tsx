import { createContextId, useContext, component$, useStore, useContextProvider, Slot, useVisibleTask$, useSignal } from "@builder.io/qwik";

export interface RouteLocation {
    // (undocumented)
    readonly isNavigating: boolean;
    // (undocumented)
    readonly params: Readonly<Record<string, string>>;
    // (undocumented)
    readonly prevUrl: URL | undefined;
    // (undocumented)
    readonly url: URL;

    ln: string
    lc: string
    dir: 'ltr'|'rtl'|'auto'
    avail: string[]
  }
  
  export const RouteLocationContext = /*#__PURE__*/ createContextId<RouteLocation>('qc-l');
  
  export const useLocation = () => useContext(RouteLocationContext);
  
  const rtl = ["iw","ar"]

export interface Props {
    url: URL
  avail: string
  default: string
  defaultlc?: string
}

// this won't work because we need to generate the page statically
  export const LocationProvider = component$<Props>((params) => {

    const loc : RouteLocation = {
        isNavigating: false,
        params: {},
        prevUrl: undefined,
        url: params.url,
        ln: params.default,
        lc: "",
        dir: "ltr",
        avail: []
    }
    let ln = loc.url.pathname.split('/')[1]
    if (params.avail.includes(ln)) {
        ln = ln
    }
    const r = useSignal<RouteLocation>(loc)
    // we need to set up a visible task so when we do a local navigate, we can update the location
    useVisibleTask$(() => {
        //  we need to set an update event
        window.addEventListener('popstate', (e) => {
        r.value = {
            isNavigating: false,
            params: {},
            prevUrl: undefined,
            url: new URL(window.location.href),
            ln: "en",
            lc: "",
            dir: "ltr",
            avail: []
          };
          useContextProvider(RouteLocationContext, loc );
        })
    })

    useContextProvider(RouteLocationContext, loc );
    return <Slot />
  })