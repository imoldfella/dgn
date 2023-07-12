

import { LanguageProvider, LoginProvider, ThemeProvider } from "./provider";
import { Router, RouterOutlet, RoutingConfigItem } from "./provider/router";

import "./global.css";
import { component$, } from "@builder.io/qwik";
import { Onboard, Signin } from "./onboard";
import { isServer } from "@builder.io/qwik/build";
//import { initTranslations } from "./i18n";

import EN from "./locale/message.en.json";
import IW from "./locale/message.iw.json";
import ES from "./locale/message.es.json";
const foo = { EN, IW, ES }

const trl(ln: string,key: string, ...args: any[]) {
  const data = {
    en: EN,
    iw: IW,
    es: ES
  }
  const a : Translation = data[ln]
  
  const templ = data[ln].translations[key]
  for (
}
export function translate(key: TemplateStringsArray, ...args: readonly any[]):string {

  return foo
}

<<<<<<< Updated upstream
export default () => {
=======

export const ThemeBootstrap = component$(() => {

  const code = `      if(localStorage.theme==="dark"){
    document.documentElement.classList.add("dark");}
  else if(typeof localStorage.theme==="undefined"){
    if(window.matchMedia("(prefers-color-scheme: dark)").matches){
      document.documentElement.classList.add("dark");}
      localStorage.theme="dark";
    }
    window.$localize = (key) => {
        return key[0]
      }
    `
  return <script dangerouslySetInnerHTML={code} />
})
export default component$(() => {
   if (isServer) {
      global.$localize = translate
    }

>>>>>>> Stashed changes
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