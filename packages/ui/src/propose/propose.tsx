import { component$ ,$} from "@builder.io/qwik"
import { Dialog } from "../toc"
import { useApp } from "../tool"
import { blueButton } from "../theme"

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
    const newWebsite = $(() => {
    })
    const proposeChange = $(() => {
    })
    return <Dialog>
        <div>Drafts</div>
       <div> <button class={blueButton} onClick$={newWebsite}>New Website</button></div>
       <div> <button class={blueButton} onClick$={proposeChange}>Propose edit</button></div>

       <div>Ready to publish<button>Publish</button></div>

       <div>Recently Published</div>
       <div> old draft #1 <button>Rollback</button></div>

       <div>Unresolved Drafts</div>
        <Query query={draftsQuery}>
            </Query>
        </Dialog>
})