import { component$ } from "@builder.io/qwik"
import { useLogin, useTheme } from "../provider"
import { useLocation } from "../provider/router"

export const Info = component$(() => {
    const rt = useLocation()

  const lg = useLogin()
  const th = useTheme()
  return <>
    <div>Router: {JSON.stringify(rt)}</div>

    <div>Login: {JSON.stringify(lg)}</div>
    <div>Theme: {JSON.stringify(th)}</div>
    </>
})
