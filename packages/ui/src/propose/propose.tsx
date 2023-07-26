import { component$ ,$} from "@builder.io/qwik"
import { Dialog } from "../toc"
import { useApp } from "../tool"
import { blueButton, chevronRight, personIcon, proposeIcon } from "../theme"
import { Icon } from "../headless"

export interface QuerySchema {
}
const draftsQuery : QuerySchema = {
}

export const Query = component$<{query: QuerySchema}>(() => {
    const app = useApp()
    return <div>Query</div>
})

// I need a way to stack dialogs
// i need a way to make that work with side panel
// 

// create a new draft, change to an existing draft
export const Propose = component$(() => {
    const app = useApp()
    const newWebsite = $(() => {
    })
    const proposeChange = $(() => {
    })
    return <Dialog>
               <div class='mb-2 flex w-full  hover:underline'>
            <Icon svg={personIcon} class='mr-1' /><div class='flex-1'>{app.branch.value}</div><Icon  svg={chevronRight} class='h-5 w-5 block' /></div>

        <div class='mb-2 flex w-full  hover:underline'>
            <Icon svg={proposeIcon} class='mr-1'/>
            <div class='flex-1'>{app.branch.value}</div><Icon  svg={chevronRight} class='h-5 w-5 block' /></div>


       <div>Ready to publish<button>Publish</button></div>

       <div>Recently Published</div>
       <div> old draft #1 <button>Rollback</button></div>

       <div>Unresolved Drafts</div>
        <Query query={draftsQuery}>
            </Query>
        </Dialog>
})