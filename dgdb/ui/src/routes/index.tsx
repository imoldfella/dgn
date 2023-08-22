import { component$, useVisibleTask$ } from "@builder.io/qwik";
import { useLocation, useNavigate, type DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  const nav = useNavigate()
  const loc = useLocation()
  useVisibleTask$(() => {
    if (loc.url.pathname === '/') {
      // we should go to the users home page, 
      // /en/query/user/home
      // /en/query/~guest/home
      // namespaces
      //  human language
      //  developer
      //  user
      //  user chosen
      nav('/en/q/~guest/home')
    }
  })

  return (
    <>
    </>
  );
});

export const head: DocumentHead = {
  title: "Datagrove",
  meta: [
    {
      name: "Datagrove",
      content: "Datagrove",
    },
  ],
};
