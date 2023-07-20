import { component$, useSignal } from "@builder.io/qwik"
import { InputLine, InputTo, RichEditor } from "../lexical/lexical";


export function hasContacts() : boolean {
   return ('contacts' in navigator && 'ContactsManager' in window);
}

interface Contact {
    email: string[]
    name: string[]
    tel: string[]
}
// needs to be in a gesture
export function selectContact() : Contact[]{
    const n = navigator as any    
    // props = navigator.contacts.getProperties()
    const props = ['name', 'email', 'tel', 'address', 'icon'];
    const opts = {multiple: true};

    const c = n['contacts']
    return c.select(props, opts)
}

const Hr = function() {
    return <hr class='border-neutral-500'/>
}

// should message drafts be shared with other devices?
// do we need some structure than for connecting these fields with databases?





export const Share = component$(() => {
    const showSubject = useSignal(false)

    // this should work like share a message
    // share will probably change on devices to include local share options
    // on the web are limited, contact api for example is not widely supported.
    // using lexical for inputs is a good idea, because it allows inlining formatting.
    return <form> 
            <div> <InputTo/></div>
            
            <Hr/>
             { showSubject && <div> <InputLine/></div>}
        
            <Hr/>
            <RichEditor/>
            
        </form>
})