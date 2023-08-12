import { component$ } from "@builder.io/qwik"

// {props.config[which.value].component}
export const ThemeBootstrap = component$(() => {
    // how do we tell development mode?
    const code = `if(localStorage.theme==="dark"){
      document.documentElement.classList.add("dark");}
    else if(typeof localStorage.theme==="undefined"){
      if(window.matchMedia("(prefers-color-scheme: dark)").matches){
        document.documentElement.classList.add("dark");}
        localStorage.theme="dark";
      }`
    return <script dangerouslySetInnerHTML={code} />
  })
  