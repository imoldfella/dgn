

import { LoginProvider, ThemeBootstrap } from "./provider";
import { Router, RouterOutlet, RoutingConfigItem, useLocation } from "./provider/router";

import "./global.css";
import { component$, useComputed$, useSignal, useStore, useVisibleTask$, } from "@builder.io/qwik";
import { Onboard, Signin } from "./onboard";
import { LocaleProvider } from "./i18n";
import { PageTool } from "./tool";


type RoutingConfig = RoutingConfigItem[];

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
interface Login {
  did: string
  until: number
}

// we might be going directly to a subdomain
// 1. if subdomain is taken, then we should go to that page with whatever login we have
// 2. if subdomain is not taken, then we should default that into the website name.
const Outlet = component$((props) => {
  const login = useSignal<Login|null>(null)

  useVisibleTask$(() => {
    const e  = JSON.parse(localStorage.getItem("login")??'null')
    addEventListener('storage', (e) => {
      if (e.key === "login") {
        const o = JSON.parse(e.newValue??'null')
        login.value = o
      }
    })

  })

  // I need something to pop up as a welcome.
  // we could default to the account page?
  const loc = useLocation()
  const isSignin = useComputed$(() => {
    return loc.url.endsWith("/signin")
  })
  return <PageTool/>
})

// thise needs to be executed for each page fetch/cache
// we need to resolve the database fetch so to include the base html
// that html can have QRLs in it. A challenge is to build it all together, as the QRL's may change. Publish implies an SSG step. A challenge is then to allow some changes incrementally patching the underlying site, perhaps these are only loaded from json? sanitizing the json is easier than sanitizing html, although clients that can write pages are trusted? How do we authorize roots for the various database slices?
export default component$(() => {
  return <>
      <head >
        <meta charSet="utf-8" />
        <ThemeBootstrap />
      </head>
      <body lang="en" class='prose dark:prose-invert dark:bg-black dark:text-white'>
       <Router>
        <LocaleProvider>
          <LoginProvider>
            <Outlet/>
          </LoginProvider>
        </LocaleProvider>
        </Router>
      </body>    
  </>
})

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


