import { component$, useVisibleTask$ } from "@builder.io/qwik";
import { useLocation, useNavigate, type DocumentHead } from "@builder.io/qwik-city";

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
      <h1>Hi 👋</h1>
      <p>
        Can't wait to see what you build with qwik!
        <br />
        Happy coding.
      </p>
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
