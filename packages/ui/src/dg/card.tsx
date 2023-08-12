import { Slot, component$ } from "@builder.io/qwik"
import { Icon } from "../headless"

export const Card = component$( (props: { href: string, name: string, icon: string }) => {
    return <Link href={props.href}><div class='p-2 m-2 w-28 h-28 flex flex-col justify-center text-center bg-neutral-900 hover:dark:bg-neutral-500 rounded-md' ><div class='flex justify-center w-full'><Icon svg={props.icon} class='h-12 w-12' /></div>
        <div> {props.name}</div>
    </div></Link>
})

// const click = (m: MenuEntry) => {
//     console.log("click", m)
// }

export const EventCard = component$( () => {
    return <div class='w-full flex items-center  p-2 bg-neutral-900 hover:dark:bg-neutral-500 rounded-md' >
        <div class='flex '><Icon svg={homeModern} class='h-12 w-12' /></div>
        <div class='flex-grow ml-2'><Slot/>
        </div></div>
})
