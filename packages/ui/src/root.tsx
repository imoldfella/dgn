

import { ThemeBootstrap, ThemeProvider } from "./provider";
import { Router, RouterOutlet, RoutingConfigItem } from "./provider/router";

import "./global.css";
import { component$, } from "@builder.io/qwik";
import { Onboard, Signin } from "./onboard";

export default component$(() => {
  return <>
    <head >
      <meta charSet="utf-8" />
      <ThemeBootstrap/>
    </head>
    <body lang="en" class='prose dark:prose-invert dark:bg-black dark:text-white'>
      <Router avail='en es iw' default='en'>
          <ThemeProvider>
            <App />
          </ThemeProvider>
      </Router>
    </body>
  </>
})

type RoutingConfig = RoutingConfigItem[];
const routingConfig: RoutingConfig = [
  {
    path: '',
    component: <Onboard/>
  },
  {
    path: 'signin',
    component: <Signin/>
  },
  {
    path: 'home',
    component: <div>user</div>
  }
]

const App = component$(() => {
  return <>
    <RouterOutlet config={routingConfig} />
  </>
})