import { component$ } from "@builder.io/qwik"
import { useLanguage, useLogin, useTheme } from "../provider"
import { useLocation } from "../provider/router"

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
