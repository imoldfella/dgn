import { $,component$, useStore, useVisibleTask$ } from "@builder.io/qwik"
import { SimpleDialog, Close, useApp, AppStore } from "../tool"
import { H2 } from "../theme"
import { Query , QueryBody, QueryResult, newQuery} from "../query"
import { UserBasic } from "../login"
import { CleanupFn } from "../post/post"

const input = 'dark:text-white dark:bg-black'
interface Group {
    user: UserBasic[]
    lastMessage: string
}

  export   const GroupItem = component$((props: {index: number})=>{
        return <div class='flex items-center'>yo</div>
    })

export function dmQuery(app: AppStore, qr: QueryResult<Group>,cleanup: CleanupFn ){
    for (let i = 0; i<20; i++) {
        qr.cache.push({user: [
            
        ], lastMessage: 'hello'})
    }
}

export const DmList = component$(()=>{
    const app = useApp()
    const q: QueryResult<Group> = useStore(newQuery())
    useVisibleTask$(({ cleanup})=>{
        // we don't need to track anything here? maybe we should track a login state? should we converge all the logins into this query or is that a security issue? allow user to decide?
        dmQuery(app, q,cleanup)
    })
    const f = $((index: number)=>{
        return <GroupItem index={index}/>
    })
    return <SimpleDialog>
        <Close/>
        <input class={input} type="text" placeholder="To"/>
        <Query query={q}>
            <QueryBody for={f} />
        </Query>
        </SimpleDialog>
})