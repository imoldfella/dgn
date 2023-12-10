import { component$ } from "@builder.io/qwik";
import { useLocation, type DocumentHead } from "@builder.io/qwik-city";
import { LanguageSelect, PageProvider, usePage } from "../../components/location";


export const Look =  component$(() => {
  const loc = usePage()
  return <div class='fixed bottom-0 right-0 bg-gray-200 text-gray-800 p-2'>
    Debug
    <div>loc: {loc.url.pathname},{loc.ln}</div>
    </div>
})

export default component$(() => {
  const loc = useLocation()
  return (
    <PageProvider avail="en es" default="en" url={loc.url}>
      Hello
      <Look/>
      kk{loc.params.catchall}rr
      <LanguageSelect/>
    </PageProvider>
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
