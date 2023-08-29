import { Resource, component$, useContextProvider, useResource$, useSignal, useStore, useVisibleTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import {  useLocation } from '@builder.io/qwik-city'

import { type Signin, SigninForm } from '@ui/login'
import { AppContext, type AppStore, DmList, Edit, PageTool, PostStream, Search, type Tool, messageQuery, type AppConfigure, useApp } from '@ui/dg'
import { $localize } from '@ui/i18n'
import { H2, Icon, bubble, cart, elipsis, link, pencil, search } from '@ui/theme'
import { newQuery } from '@ui/query'

export const head: DocumentHead = {
  title: "Datagrove",
  meta: [
    {
      name: "Datagrove",
      content: "Datagrove",
    },
  ],
}

export const Cart = component$(() => {
  return <Icon svg={cart} class='dark:text-white h-6 w-6' />
})
export const More = component$(() => {
  return <Icon svg={cart} class='dark:text-white h-6 w-6' />
})


  // we should have this as a default, but allow the app to override it.
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

const config : AppConfigure =  {
  oauth: [
    { name: "Google" },
  ],
  oauthMore: [

  ]
}


export const ToolDialog = component$(() => {
  const app = useApp()
  // do not require login.
  switch (app.tab) {
    case "": return null
    case "search": return <Search />
    case "cart": return <Cart />
    case "more": return <More />
    case "signin": return <SigninForm />
  }

  // requires login.
  if (null==app.me) {
    return <SigninForm/>
  }
  switch (app.tab) {
    case "edit": return <Edit />
    case "share": return <DmList/>
  }
  return <div />
})

export const Content = component$(() => {
  const loc = useLocation() // should be signal?
  const query = useStore(newQuery<any>())
    const app = useApp()
    // only called when page and query have been resolved.
    // the resolution may be that the page

    // if the page can be created by the logged in user, we should give that option.
    if (query.error=='login') {
      return <div class='flex flex-col items-center justify-center h-screen'>
          <H2>This page is not available</H2>
          { !app.me.value && <div>It may become available if you <button class={link} onClick$={()=>{ app.y=400; app.tab='signin'}}>sign in</button></div> }
          { app.me.value && <><div>You are logged in as {app.me.value.name}</div><div>. It may become available if you sign in with a different account </div></> }
        </div>
    }
    switch (query.type) {
      case 'newestTop': return <PostStream query={query} />
      case 'oldestTop': return <PostStream query={query} oldestTop />
    }
    return <div >Can't open ({query.type})</div>
  



  // should tools be part of the url? should we be able to link to edit mode for example? not needed. why even pick tools here then, other than as configuration?
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const sproc = useResource$(async ({ track, cleanup }) => {
    // queries need to be async. query starts in loading state.
    track(() => loc)
    await messageQuery('newestTop', query, { id: loc.url.pathname }, cleanup)
    //query.error = 'login'
  })


  return <></>
})

//         {loc.params.ln} {loc.params.tool} {loc.params.slice} {loc.params.path} { c }

// move to root
const Outlet = component$(() => {
  const me = useSignal<Signin|null>(null)
  useVisibleTask$(() => {
    const o =  localStorage.getItem('user') 
    if (o) {
      me.value = JSON.parse(o) as Signin
    }
  })
  const app = useStore<AppStore>({
    config: config,
    me: me,
    tab: "",
    y: 46,
    branch: "First draft",
    tool: tool,
    mobile: false,
  })
  useContextProvider(AppContext, app);  //const tool = u.searchParams.get('tool')??""

  return <>
    { me.value ?  <div>{me.value.name}</div> : <SigninForm/>  }
    </>
})

export default Outlet

/*
app.me.value==null? <SigninForm/> :
    <PageTool >
    <div q:slot='tools'><ToolDialog /></div>
    <Resource
      value={sproc}
      onPending={() => <>Loading...</>}
      onRejected={(error) => <>Error: {error.message}</>}
      onResolved={() => } />
  </PageTool>
  */