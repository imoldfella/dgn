import {  component$, Slot, useStore, useVisibleTask$ } from '@builder.io/qwik';
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
    useVisibleTask$(() => {
        theme.dark = document.documentElement.classList.contains("dark")
    })
    return <>
    <Slot /> 
    
    </>
    });

export const useTheme = () => useContext(ThemeContext);

