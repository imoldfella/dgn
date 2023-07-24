import { component$ } from "@builder.io/qwik"
import { Dialog } from "../toc"

export interface QuerySchema {
}
const draftsQuery : QuerySchema = {
}

export const Query = component$<{query: QuerySchema}>(() => {
    return <div>Query</div>
})

// create a new draft, change to an existing draft
export const Propose = component$(() => {
    return <Dialog>
        <div>Drafts</div>
        <Query query={draftsQuery}>
            </Query>
        </Dialog>
})