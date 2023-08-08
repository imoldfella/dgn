

import { SigninProvider, ThemeBootstrap, useSignin } from "./provider";
import { Router, RoutingConfigItem, useLocation } from "./provider/router";

import "./global.css";
import { Component, component$, useSignal, useVisibleTask$, } from "@builder.io/qwik";
import {  MessageStream } from "./message";
import { $localize, LanguageSelect, LocaleProvider } from "./i18n";
import { Edit, PageTool, Review, useApp } from "./tool";
import { Signin2, Signup } from "./message/signup";
import { Account } from "./account";
import { FileBrowser } from "./filebrowser";
import { More } from "./more";
import { Propose } from "./propose";
import { Search } from "./search";
import { Avatar, Share } from "./share";
import { TocTabbed } from "./toc";
import example from "./toc/test.en"
import { DarkButton, cart, search } from "./theme";
import { Icon } from "./headless";
import { makeShared } from "./opfs";

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

const Outlet = component$((props) => {
  //const nav = useNavigate()
  const loc = useLocation() // should be signal?
  const u = new URL(loc.url)
  if (u.pathname === "/") {
    if (window?.navigator) {
      // nav("/en/timeline")
    }
   
  }
  const tool = u.searchParams.get('tool')??""
  const path = u.pathname.split('/')
  const content = path[1]??"" // should be signal?

  if (loc.url.endsWith("/signin") ) return <Signin2/>
  if (loc.url.endsWith("/signup") ) return <Signup/>
  
  // <ToolDialog q:slot='tool'/>
  // <ToolDialog q:slot='tool'/>

  let X : Component<{}>
  switch(content) {
    default:
    case "timeline": X = Timeline; break;
  }
 

  return <PageTool tool={tool}>
    <div q:slot='tool'>WTF</div>
    {/* <div>{JSON.stringify(loc)}</div> */}
     <X/>
      </PageTool>
})

// 
export const Timeline = component$(() => {
  const me = useSignin()
  return <><div class=' hidden large:flex  items-center'>
                <div class='p-1'><Avatar user={me} /></div>
            <SearchBox /><LanguageSelect  /><DarkButton /></div>
           <MessageStream/>
        </>
})

export const ToolDialog = component$(() => {
    const app = useApp()
    switch (app.tab.value) {
        case "menu": return <TocTabbed toc={example} />
        case "search": return <Search />
        case "share": return <Share />
        case "cart": return <Cart />
        case "edit": return <Edit />
        case "files": return <FileBrowser />
        case "propose": return <Propose />
        case "review": return <Review />
        case "account": return <Account />
        case "more": return <More />
    }
    return <div />
})



// thise needs to be executed for each page fetch/cache
// we need to resolve the database fetch so to include the base html
// that html can have QRLs in it. A challenge is to build it all together, as the QRL's may change. Publish implies an SSG step. A challenge is then to allow some changes incrementally patching the underlying site, perhaps these are only loaded from json? sanitizing the json is easier than sanitizing html, although clients that can write pages are trusted? How do we authorize roots for the various database slices?
export default component$(() => {
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