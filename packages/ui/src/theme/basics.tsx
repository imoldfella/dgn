
import { HTMLAttributes, Slot, component$} from '@builder.io/qwik';
import { useLocation } from '../provider';
import { useLocale } from '../i18n';
export function classNames(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
export type AnchorProps = HTMLAttributes<HTMLAnchorElement>
export type LinkProps = HTMLAttributes<HTMLAnchorElement> & {href: string}
export const Ab = component$((props: LinkProps) => {
  const loc = useLocation()
  const ln =  useLocale()
  const href = new URL( "/" + ln.ln + props.href,loc.url).href
    return <a {...props} href={href} class={`no-underline dark:text-blue-400 text-blue-700 hover:text-blue-500 hover:underline ${props.class}`}>
        <Slot/>
    </a>
})

type DivProps = HTMLAttributes<HTMLDivElement>
export const H2 = component$<DivProps>((props) => {
  return <h2 class={`pt-4 text-2xl font-bold dark:text-white ${props.class}`}>
    <Slot/>
  </h2>
})

export const H3 = component$<DivProps>((props) => {
  return <h3 class={`pt-4 pb-2 text-xl font-bold dark:text-white ${props.class}`}><Slot/></h3>
})
