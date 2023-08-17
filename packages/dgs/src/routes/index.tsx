import { component$ } from "@builder.io/qwik";
import { type DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  // const nav = useNavigate()
  // const loc = useLocation()
  // useVisibleTask$(() => {
  //   if (loc.url.pathname === '/') {
  //     nav('/en/tool/org/slice/querypath')
  //   }
  // })

  return (
    <>
    hello, world
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
