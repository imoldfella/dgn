
# authorization

you don't need to use datagrove authorization infrastructure; you can replace the login api with whatever works in your infrastructure. By some process. You can use datagrove without logins, with the tradeoff that you have less control over your infrastructure resources. You also would have fewer options for recoverying user accounts. Without logins, you can still have full encryption and security (completely managed on the edge)

what if we did something more like quik speak

t = useLang()

$t( )

hard to find? $localize is easy to find.

type AnchorProps = HTMLAttributes<HTMLAnchorElement>

// link needs to respect the language.
// the language selector needs to respect the rest of the path.
export const Link = component$<AnchorProps&{href:string}>((props) => {
  const loc = useLocation()
  const href = new URL("/" + loc.value+props.href, loc.value).href
  return <a {...props} href={href} > <Slot /> </a>
})


export function getWindow(): Window | undefined {
  if (!isServer) {
    return typeof window === 'object' ? window : undefined
  }
  return undefined;
}
