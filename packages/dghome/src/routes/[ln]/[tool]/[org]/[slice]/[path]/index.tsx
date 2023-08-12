import { Resource, component$, useContextProvider, useResource$, useSignal, useStore, useTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$, useLocation } from '@builder.io/qwik-city'

import { Signin, } from '@ui/login'
import { AppContext, AppStore, Edit, PageTool, PostStream, Tool } from '@ui/dg'
import { $localize } from '@ui/i18n'
import { H2, bubble, cart, elipsis, link, pencil, personIcon, search } from '@ui/theme'
import { newQuery } from '@ui/query'


const content = routeLoader$<string>(async ()=> {
    return "Hello World"
})


const tool: Tool[] = [
  // the menu is sync'd to the current page.

  { name: "search", desc: $localize`Find`, svg: search },
  { name: "share", desc: $localize`Message`, svg: bubble },

  // behind "more" on mobile. we could also hide and require them to be in the menu
  // { name: "edit", desc: $localize`Edit`, svg: tablet },
  // { name: "files", desc: $localize`Files`, svg: folder },
  { name: "cart", desc: $localize`To do`, svg: cart },
  { name: "edit", desc: $localize`Edit`, svg: pencil },
  { name: "more", desc: $localize`More`, svg: elipsis },

  //{ name: "account", desc: $localize`Account`, svg: personIcon },
  // how do I lock the main branch?
  // vote for adoption, publish
  // { name: "propose", desc: $localize`Propose`, svg: proposeIcon },
  // { name: "review", desc: $localize`Review`, svg: reviewIcon },

  //{ name: "data", desc: $localize`Data`, svg: circleStack },
]

const Outlet = component$(() => {

  const loc = useLocation() // should be signal?

  const u = new URL(loc.url)

  const me = useSignal<Signin|null>({
    id: 1,
    name: 'test', 
    handle: 'test',
    avatar: '',
  })

  const app = useStore<AppStore>({
    me: me,
    tab: "",
    y: 46,
    branch: "First draft",
    tool: tool,
    mobile: false,
  })

  useTask$(async () => {
    me.value = {
      id: 1,
      name: 'test',
      handle: 'test',
      avatar: personIcon
    }
  })
  useContextProvider(AppContext, app);  //const tool = u.searchParams.get('tool')??""
  const query = useStore(newQuery<any>())


  // this can't be a component?, because it is called from resource?.
  // apparently it can call components though?
  const ContentPage = () => {
    // only called when page and query have been resolved.
    // the resolution may be that the page

    // if the page can be created by the logged in user, we should give that option.
    if (query.error=='login') {
      return <div class='flex flex-col items-center justify-center h-screen'>
          <H2>This page is not available</H2>
          { !me.value && <div>It may become available if you <button class={link} onClick$={()=>{ app.y=400; app.tab='signin'}}>sign in</button></div> }
          { me.value && <><div>You are logged in as {me.value.name}</div><div>. It may become available if you sign in with a different account </div></> }
        </div>
    }
    switch (query.type) {
      case 'newestTop': return <PostStream query={query} />
      case 'oldestTop': return <PostStream query={query} oldestTop />
    }
    return <div >Can't open ({query.type})</div>
  }


  const ToolDialog = component$(() => {
    // do not require login.
    switch (app.tab) {
      case "": return null
      case "search": return <Search />
      case "cart": return <Cart />
      case "more": return <More />
      case "signin": return <Signin2 />
    }

    // requires login.
    if (null==app.me) {
      return <Signin2/>
    }
    switch (app.tab) {
      case "edit": return <Edit />
      case "share": return <DmList/>
      // case "files": return <FileBrowser />
      // case "propose": return <Propose />
      // case "review": return <Review />
      // case "account": return <Account />
    }
    return <div />
  })

  // should tools be part of the url? should we be able to link to edit mode for example? not needed. why even pick tools here then, other than as configuration?
  const sproc = useResource$(async ({ track, cleanup }) => {
    // queries need to be async. query starts in loading state.
    track(() => loc)
    await messageQuery('newestTop', query, { id: loc.id }, cleanup)
    //query.error = 'login'
  })

  return <PageTool >
    <div q:slot='tools'><ToolDialog /></div>
    <Resource
      value={sproc}
      onPending={() => <>Loading...</>}
      onRejected={(error) => <>Error: {error.message}</>}
      onResolved={() => <ContentPage />} />
  </PageTool>
})


export default component$(() => {
    const loc = useLocation()
    const c = content()
  return (
    <>
        {loc.params.ln} {loc.params.tool} {loc.params.slice} {loc.params.path} { c }
        <Outlet />
        
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
