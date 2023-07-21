import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$, useLocation } from '@builder.io/qwik-city'

// 
const content = routeLoader$<string>(async ()=> {
    return "Hello World"
})

export default component$(() => {
    const loc = useLocation()
    const c = content()
  return (
    <>
        {loc.params.ln} {loc.params.tool} {loc.params.path} { c }
    </>
  );
});

export const head: DocumentHead = {
  title: "Welcome to Qwik",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
};
