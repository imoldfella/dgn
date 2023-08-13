import { component$ ,$} from "@builder.io/qwik"
import { Dialog } from "../toc"
import { useApp } from "../dg"
import { Toggle, blueButton, chevronRight, personIcon, proposeIcon } from "../theme"
import { Icon } from "../headless"
import { JSX } from "@builder.io/qwik/jsx-runtime"

export interface QuerySchema {
}
const draftsQuery : QuerySchema = {
}

// I need a way to stack dialogs
// i need a way to make that work with side panel
// 

// how can we combine different drafts before publishing?

export const PickDraft = component$(()=>{
    return <Dialog></Dialog>
})

// one idea is to have growing store with a component that loads it with a fetch when the loading becomes visible
// 
export const Query = component$((props)=>{
    return <>
        Query
    </>
    })

// add a list of unapproved drafts with arrow to review them (approve, reject, unwatch)
// create a new draft, change to an existing draft
export const Propose = component$(() => {
    const app = useApp()
    const newWebsite = $(() => {
    })
    const proposeChange = $(() => {
    })
    return <Dialog>
               <div class='mb-2 flex w-full  hover:underline'>
            <Icon svg={personIcon} class='mr-1' /><div class='flex-1'>{app.me.value!.name}</div><Icon  svg={chevronRight} class='h-5 w-5 block' /></div>

        <div class='mb-2 flex w-full  hover:underline'>
            <Icon svg={proposeIcon} class='mr-1'/>
            <div class='flex-1'>{app.branch}</div><Icon  svg={chevronRight} class='h-5 w-5 block' /></div>

        <div class='mb-2 flex w-full  hover:underline'>
            <Icon svg={proposeIcon} class='mr-1'/>
            <div class='flex-1'>Edit</div><Toggle/></div>


       <div class='mb-2 flex w-full  hover:underline'>
            <Icon svg={proposeIcon} class='mr-1'/>
            <div class='flex-1'>Rollback</div><Icon  svg={chevronRight} class='h-5 w-5 block' /></div>

        

        </Dialog>
})

/*
       <div><button class={blueButton + ' w-full'}>Publish First draft</button></div>
       <div>Recently Published</div>
       <div> old draft #1 <button>Rollback</button></div>

       <div>Unresolved Drafts</div>
        <Query query={draftsQuery}>
            </Query> 
        */