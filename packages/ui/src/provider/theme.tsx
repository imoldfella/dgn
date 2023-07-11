import {  component$, Slot, useStore } from '@builder.io/qwik';
import {
  useContext,
  useContextProvider,
  createContextId,
} from '@builder.io/qwik';
 

export interface Theme {
    dark: boolean;
}

export const ThemeContext = createContextId<Theme>(
  'docs.theme-context'
);

// not sure what to do about theme provider if it needs to be global or not.
// we probably do want to impact the body tag, but maybe we don't need to.
// potentially use this as a store for things like listening to the size and deciding media query type things.
// container queries are shipping in everything, so maybe we should avoid that.
export const ThemeProvider =  component$(() => {
    const theme = useStore<Theme>({
        dark: true,
    });
    useContextProvider(ThemeContext, theme);
    return <Slot /> 
    });

export const useTheme = () => useContext(ThemeContext);

// only has global things, only use once per page.
export const ThemeBootstrap = component$(()=>{
    return <script dangerouslySetInnerHTML={`if(localStorage.theme==="dark"){document.documentElement.classList.add("dark");}else if(typeof localStorage.theme==="undefined"){if(window.matchMedia("(prefers-color-scheme: dark)").matches){document.documentElement.classList.add("dark");}}`} />

    })