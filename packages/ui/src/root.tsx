

import { LoginProvider, ThemeBootstrap } from "./provider";
import { Router, RouterOutlet, RoutingConfigItem } from "./provider/router";

import "./global.css";
import { component$, } from "@builder.io/qwik";
import { Onboard, Signin } from "./onboard";
import { LocaleProvider } from "./i18n";
import { PageTool } from "./tool";


type RoutingConfig = RoutingConfigItem[];
const routingConfig: RoutingConfig = [
  {
    path: '',
    component: <Onboard />
  },
  {
    path: 'signin',
    component: <Signin />
  },
  {
    path: 'edit',
    component: <PageTool/>
  }
]

// thise needs to be executed for each page fetch/cache
// we need to resolve the database fetch so to include the base html
// that html can have QRLs in it. A challenge is to build it all together, as the QRL's may change. Publish implies an SSG step. A challenge is then to allow some changes incrementally patching the underlying site, perhaps these are only loaded from json? sanitizing the json is easier than sanitizing html, although clients that can write pages are trusted? How do we authorize roots for the various database slices?
export default component$(() => {
  return <>
    <Router>

      <head >
        <meta charSet="utf-8" />
        <ThemeBootstrap />
      </head>
      <body lang="en" class='prose dark:prose-invert dark:bg-black dark:text-white'>
        <LocaleProvider>
          <LoginProvider>
            <RouterOutlet config={routingConfig} />
          </LoginProvider>
        </LocaleProvider>
      </body>
    </Router>
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


