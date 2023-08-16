import Icon from "../headless/icon";

import { $, HTMLAttributes, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { component$} from "@builder.io/qwik";
import { moon, sun } from "./icon";

export const DarkButton = component$<HTMLAttributes<HTMLDivElement>>((props) => {
  const dark = useSignal(false);
   useVisibleTask$(() => {
    dark.value =  document.documentElement.classList.contains("dark")
  })

// export function setDark( dark: boolean) {
//     const html = document.querySelector("html")!
//     dark ? html.classList.add("dark") : html.classList.remove("dark");
//   }
 const toggleDark = $(() =>{
    if (document) {
      const html = document.querySelector("html");
      html?.classList.toggle("dark");
      dark.value = !dark.value
    }
  })

  return <>
      <button
        type="button"
        aria-label={`Use ${dark.value ? "light" : "dark"} mode`}
        onClick$={() => toggleDark()}
        class={props.class}
      >
        {dark.value ? (
          <Icon class="w-8 h-8" svg={sun}/>
        ) : (
          <Icon class="w-8 h-8" svg={moon}/>
        )}
      </button>
    </>
});

export default DarkButton;
