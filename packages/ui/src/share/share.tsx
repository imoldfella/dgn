import { component$, useComputed$, useSignal } from "@builder.io/qwik"
//import { RichEditor } from "../lexical/lexical";
import { $localize } from "../i18n";
import { DivProps } from "../tool/modal";
import { Link, link, useNavigate, useSignin } from "../provider";
import { Icon } from "../headless";
import { paperClip, personIcon } from "../theme";
import { Close } from "../tool";


export function hasContacts(): boolean {
    return ('contacts' in navigator && 'ContactsManager' in window);
}

interface Contact {
    email: string[]
    name: string[]
    tel: string[]
}
// needs to be in a gesture
export function selectContact(): Contact[] {
    const n = navigator as any
    // props = navigator.contacts.getProperties()
    const props = ['name', 'email', 'tel', 'address', 'icon'];
    const opts = { multiple: true };

    const c = n['contacts']
    return c.select(props, opts)
}

const Hr = function () {
    return <hr class='border-neutral-500' />
}

// should message drafts be shared with other devices?
// do we need some structure than for connecting these fields with databases?

const defaultAvatar = 'https://avatars.githubusercontent.com/u/5510808?v=4'
// needs to be async, cached, fetch
// needs to support png
export const Avatar = component$(({ user,  }: { user: any }) => {
    const nav = useNavigate()
    if (user.image)
   return <img
        src={user.image }
        alt="user avatar"
        onClick$={()=>nav(`/user/${user.id}`)}
        width={48}
        height={48}
        class="z-0 rounded-full" />
    else return <div><Link class={link} href={`/signup`}>{$localize`Sign in`}</Link></div>
     //<Icon svg={personIcon} class='w-[48px] h-[48px]' onClick$={()=>nav('/signin')} />
    
})

export const Share = component$(() => {
    const me = useSignin()
    const nav = useNavigate()
    if (!me.value?.info) {
        nav('/signin')
        return null
    }
    const editorRef = useSignal<HTMLElement>();

    const name = useComputed$(()=> {
        return "me"
    })
    // this should work like share a message
    // share will probably change on devices to include local share options
    // on the web are limited, contact api for example is not widely supported.
    // using lexical for inputs is a good idea, because it allows inlining formatting.
    return <form class='p-2'>
        <div class='flex'>
            <Close/>
            <div class='w-16'><Avatar user={me.value!.info} /></div>
            <div class='flex-1'>
                <div class='w-full'>{name.value}</div>
                <div id='to' class='w-full' ref={editorRef} contentEditable='true' >Share to location</div>
                <div><Icon svg={paperClip} class='w-4 h-4' /></div>
            </div>
        </div>
        {/* <RichEditor /> */}
    </form>
})