

import { LoginProvider, ThemeBootstrap } from "./provider";
import { Router, RouterOutlet, RoutingConfigItem } from "./provider/router";

import "./global.css";
import { component$, } from "@builder.io/qwik";
import { Onboard, Signin } from "./onboard";
import { LocaleProvider } from "./i18n";
import { Lexical } from "./lexical/lexical";


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
    path: 'lex',
    component: <Lexical/>
  }
]

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


