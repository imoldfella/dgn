import { component$, useVisibleTask$ } from "@builder.io/qwik";
import { useLocation, useNavigate, type DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  const nav = useNavigate()
  const loc = useLocation()
  useVisibleTask$(() => {
    if (loc.url.pathname === '/') {
      const user = localStorage.getItem('user')??'~guest'
      const o = navigator.language
      const ln = localStorage.getItem('ln')??o
      // we should go to the users home page, 
      // /en/query/user/home
      // /en/query/~guest/home
      // namespaces
      //  human language
      //  developer
      //  user
      //  user chosen
      nav(`/${ln}/q/${user}/home`)
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
