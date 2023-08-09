

import { SigninProvider, ThemeBootstrap, useSignin } from "./provider";
import { Router, RoutingConfigItem, useLocation } from "./provider/router";

import "./global.css";
import { Resource, component$, useResource$, useSignal, useStore, useVisibleTask$, } from "@builder.io/qwik";
import {  PostStream } from "./message";
import { $localize, LocaleProvider } from "./i18n";
import { Edit, PageTool, Tool } from "./tool";
import { Signin2 } from "./message/signup";
import { More } from "./more";
import { Search } from "./search";
import { bubble, cart, elipsis, pencil, search } from "./theme";
import { Icon } from "./headless";
import { makeShared } from "./opfs";
import { newQuery } from "./message/query";
import { messageQuery } from "./message/post";

type RoutingConfig = RoutingConfigItem[];

export const SearchBox = component$(() => {
  return <div class='flex-1 m-2 flex items-center shadow  bg-neutral-800  rounded-lg px-1'
  > <Icon svg={search} class='dark:text-white h-6 w-6' />
      <input autoFocus
          class=" flex-1 border-0 focus:ring-0 focus:outline-none bg-transparent dark:text-white"
          placeholder={$localize`Search Datagrove`} type="search" /></div>
})

export const Cart = component$(() => {
  return <Icon svg={cart} class='dark:text-white h-6 w-6' />
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

// if the url requires a sign in, then we need to show a blank page with a sign in dialog? This should be a hidden tool. If they close the box with signing in, it should go to the datagrove home page.
// maybe if they don't have access to the page for any reason we should 404?
// the 404 could take them to a login or change login if they are already logged in.
const Outlet = component$((props) => {
  //const nav = useNavigate()
  const loc = useLocation() // should be signal?
  const me = useSignin()
  const u = new URL(loc.url)
  if (u.pathname === "/") {
    if (window?.navigator) {
      // nav("/en/timeline")
    }
  }
  //const tool = u.searchParams.get('tool')??""
  const path = u.pathname.split('/')
  const content = path[1]??"" // should be signal?

  // if (loc.url.endsWith("/signin") ) return <Signin2/>
  // if (loc.url.endsWith("/signup") ) return <Signup/>

  // why can't can call a store from useResource?
  // should we make this a signal so we can replace in one go?
  const query = useStore(newQuery<any>())

  const ContentPage = () => {
    switch(query.type) {
      case 'post': return <PostStream query={query} />
    }
    return <div >Can't open {query.type}</div>
  }

  const pickTool = useSignal("")
   const ToolDialog = component$(() => {
    // do not require login.
    switch (pickTool.value) {
        case "": return null
        case "search": return <Search />
        case "cart": return <Cart />
        case "more": return <More />        
    }

    // requires login.
    if (!me.value) {
      return <Signin2/>
    }
    switch (pickTool.value) {
        case "edit": return <Edit />

        // case "files": return <FileBrowser />
        // case "propose": return <Propose />
        // case "review": return <Review />
        // case "account": return <Account />
    }
    return <div />
})

  // should tools be part of the url? should we be able to link to edit mode for example? not needed. why even pick tools here then, other than as configuration?
  const sproc = useResource$(async ({track,cleanup}) => {
        // queries need to be async. query starts in loading state.
        track(() => loc)
        await messageQuery(query, { id: loc.id }, cleanup)
  })

  return <PageTool tool={tool} pickTool={pickTool}>
    <div q:slot='tools'><ToolDialog/></div>

            <Resource 
              value={sproc }
              onPending={() => <>Loading...</>}
              onRejected={(error) => <>Error: {error.message}</>}
              onResolved={() => <ContentPage/>} />
    </PageTool>
})





// thise needs to be executed for each page fetch/cache
// we need to resolve the database fetch so to include the base html
// that html can have QRLs in it. A challenge is to build it all together, as the QRL's may change. Publish implies an SSG step. A challenge is then to allow some changes incrementally patching the underlying site, perhaps these are only loaded from json? sanitizing the json is easier than sanitizing html, although clients that can write pages are trusted? How do we authorize roots for the various database slices?
const o1 = component$(() => {
  useVisibleTask$(()=>{
    makeShared()
  })
  return <>
      <head >
        <meta charSet="utf-8" />
        <ThemeBootstrap />
      </head>
      <body lang="en" class=' dark:bg-black dark:text-white'>
       <Router>
        <LocaleProvider>
          <SigninProvider>
            <Outlet/>
          </SigninProvider>
        </LocaleProvider>
        </Router>
        
      </body>    
  </>
})

const o2  = component$(() => {
  const x = useSignal(true)
  useVisibleTask$(()=> {
    x.value = window.crossOriginIsolated
  })

  return (
    <>
      <head>
        <meta charSet="utf-8" />
        <title>Qwik Blank App</title>
      </head>
      <body>
        sab { x.value.toString() }
      </body>
    </>
  );
})



export default o1

// <script src="/node_modules/preline/dist/preline.js"></script>
// const Info = component$(() => {
//   const loc = useLocation()
//   const lc = useLocale()
//   return <>
//     <div> {loc.value} </div>
//     <div> {lc.dir} </div>
//     <div> {lc.ln} </div>
//     <LanguageSelect />
//   </>
// })

// <RouterOutlet config={routingConfig} />


// can i use a dns that maps to local host for everything?
// the trouble with this is that we also need https for different api's to work.
// so we probably need to use our own setup for this? so then we can advertise the certificate as well. fly.io probably doesn't work because of their fancy certificates?

// if they are a new user, they should go to the onboard page
// if they are a known user, but logged out, they should go to the login page
// if they are logged in, they should go to the last page they were on? Or maybe show a list of recent websites.
// how does this work with ssr though? we need a visual task to check the localstorage?
// we need to see how qwik city is loading its service worker.
// we should probably listen to localstorage, and sign out the tab if signed out anywhere.
// any reason to not use a signal here?


// we might be going directly to a subdomain
// 1. if subdomain is taken, then we should go to that page with whatever login we have
// 2. if subdomain is not taken, then we should default that into the website name.
  // urls are content and optional tool
  // should I use ?tool= 

  // logged in:
  // if / then pick the language based on the browser or stored.
  // /en/ = timeline
  // /es/t/{id} = topic  # note that this can't be cached, it should be live.
  // 

  // maybe we should redirect a route? dns should matter?
  // only get to this root from datagrove.com?
  // in back of login we should see a list of linked sites? (each site then in a sandbox)
  // the content and the tool have 