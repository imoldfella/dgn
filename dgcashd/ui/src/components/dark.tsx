import Icon from "./icon";
import { moon, sun } from "./heroicon";
import { $, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { component$} from "@builder.io/qwik";

export const DarkButton = component$(() => {
  const dark = useSignal(false);
   useVisibleTask$(() => {
    dark.value =  document.documentElement.classList.contains("dark")
  })

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
