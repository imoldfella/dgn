

import { LanguageProvider, LoginProvider, ThemeBootstrap, ThemeProvider, useLanguage, useLogin, useTheme } from "./provider";
import { Router, RouterOutlet, RoutingConfigItem, useLocation } from "./provider/router";

import "./global.css";
import { component$ } from "@builder.io/qwik";
import { Onboard, Signin } from "./onboard";


export default () => {
  return <>
    <head >
      <meta charSet="utf-8" />
      <ThemeBootstrap/>
    </head>
    <body lang="en" class='prose dark:prose-invert dark:bg-black dark:text-white'>
      <Router>
        <LanguageProvider avail='en es iw' default='en'>
          <LoginProvider  >
          <ThemeProvider>
            <App />
          </ThemeProvider>
          </LoginProvider>
        </LanguageProvider>
      </Router>
    </body>
  </>
}

export const Info = component$(() => {
    const rt = useLocation()
  const ln = useLanguage()
  const lg = useLogin()
  const th = useTheme()
  return <>
    <div>Router: {JSON.stringify(rt)}</div>
    <div>Language: {JSON.stringify(ln)}</div>
    <div>Login: {JSON.stringify(lg)}</div>
    <div>Theme: {JSON.stringify(th)}</div>
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