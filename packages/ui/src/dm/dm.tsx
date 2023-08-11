import { $,component$, useStore, useVisibleTask$ } from "@builder.io/qwik"
import { SimpleDialog, Close, useApp, AppStore } from "../tool"
import { H2, personIcon } from "../theme"
import { Query , QueryBody, QueryResult, VirtualItem, newQuery} from "../query"
import { UserBasic } from "../login"
import { CleanupFn } from "../post/post"

const input = 'dark:text-white dark:bg-black'
interface Group {
    user: UserBasic[]
    lastMessage: string
}



export function dmQuery(app: AppStore, qr: QueryResult<Group>,cleanup: CleanupFn ){
    for (let i = 0; i<20; i++) {
        qr.cache.push({user: [
            {name: 'joe', id: 2, avatar: personIcon},
        ], lastMessage: 'hello'})
    }
    qr.length = 20

    qr.averageHeight = 48
    qr.item = qr.cache.map((_,index)=>{
        const o : VirtualItem ={
            index: 0 + index,
            key: 0+index+"",
            start: 0,
            end: 0,
            size: 0,
            lane: 0
        }
        return o
    })
}

export const DmList = component$(()=>{
    const app = useApp()
    const q: QueryResult<Group> = useStore(newQuery())
    useVisibleTask$(({ cleanup})=>{
        // we don't need to track anything here? maybe we should track a login state? should we converge all the logins into this query or is that a security issue? allow user to decide?
        dmQuery(app, q,cleanup)
    })
    const f = $((index: number)=>{
        return <div class='flex items-center'>yo</div>

    })
    return <SimpleDialog>
        <Close/>
        <input class={input} type="text" placeholder="To"/>

        <Query query={q}>
            <QueryBody for={f} />
        </Query>
        </SimpleDialog>
})