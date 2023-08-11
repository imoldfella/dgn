import { $,component$, useComputed$, useStore, useVisibleTask$ } from "@builder.io/qwik"
import { SimpleDialog, Close, useApp, AppStore } from "../tool"
import { H2, personIcon } from "../theme"
import { Query , QueryBody, QueryResult, SimpleQueryBody, VirtualItem, newQuery} from "../query"
import { UserBasic } from "../login"
import { CleanupFn } from "../post/post"
import { Icon } from "../headless"
import { timeAgo } from "../post"

const input = 'dark:text-white dark:bg-black'
interface Group {
    user: UserBasic[]
    lastMessage: string
    lastMessageTime: number
}
export function userList(g: Group) {
    return g.user.map((u,index)=> u.name).join(', ')
}
export function handleList(g: Group) {
    return g.user.map((u,index)=> u.handle).join(', ')
}


export function dmQuery(app: AppStore, qr: QueryResult<Group>,cleanup: CleanupFn ){
    for (let i = 0; i<20; i++) {
        qr.cache.push({user: [
            {name: 'joe', id: 2, avatar: personIcon, handle: 'joe'},
        ], lastMessage: 'hello'
        , lastMessageTime: Date.now()})
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


    return <SimpleDialog>
        <Close/>
        <input class={input} type="text" placeholder="To"/>

        <Query query={q}>
            <SimpleQueryBody >
                {q.cache.map((item,index)=>{

                    return <div key={index} class='flex items-center'>
                    <Icon class='block h-8 w-8' svg={personIcon}/>
                    <div class='flex flex-col w-full pl-1'>
                        <div class='text-lg'>{userList(item)} {handleList(item)} {timeAgo(new Date(item.lastMessageTime))}</div>
                        <div class='text-sm'>{item.lastMessage}</div>
                    </div>
                    </div>
                })}
            </SimpleQueryBody>
        </Query>
        </SimpleDialog>
})