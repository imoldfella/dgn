

import { LanguageProvider, LoginProvider, ThemeProvider, ThemeBootstrap, useLanguage, useLogin, useTheme } from "./provider";
import { Router, RouterOutlet, useLocation } from "./provider/router";

import "./global.css";
import { component$ } from "@builder.io/qwik";
import { Onboard } from "./onboard";


export default () => {
  return <>
    <head>
      <meta charSet="utf-8" />
    </head>
    <body lang="en" class='prose dark:prose-invert dark:bg-black dark:text-white'>
      <Router>
        <LanguageProvider avail='en es iw' default='en'>
          <LoginProvider  >
          <ThemeProvider >
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

const App = component$(() => {
  return <>
    <Onboard/>
    <RouterOutlet />
  </>
})