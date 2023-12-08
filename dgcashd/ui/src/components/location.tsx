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
  }
  
  export const RouteLocationContext = /*#__PURE__*/ createContextId<RouteLocation>('qc-l');
  
  export const useLocation = () => useContext(RouteLocationContext);
  
// this won't work because we need to generate the page statically
  export const LocationProvider = component$<{url: URL}>((params) => {

    const loc = {
        isNavigating: false,
        params: {},
        prevUrl: undefined,
        url: params.url,
    }
    const r = useSignal<RouteLocation>(loc)
    // we need to set up a visible task so when we do a local navigate, we can update the location
    useVisibleTask$(() => {
        r.value = {
            isNavigating: false,
            params: {},
            prevUrl: undefined,
            url: new URL(window.location.href),
          };
    })

    useContextProvider(RouteLocationContext, loc );
    return <Slot />
  })