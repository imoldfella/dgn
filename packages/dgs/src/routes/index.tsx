import { component$, useVisibleTask$ } from "@builder.io/qwik";
import { useNavigate, type DocumentHead, useLocation } from "@builder.io/qwik-city";

export default component$(() => {
  const nav = useNavigate()
  const loc = useLocation()
  useVisibleTask$(() => {
    if (loc.url.pathname === '/') {
      nav('/en/tool/org/slice/querypath')
    }
  })

  return (
    <>
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
