import { $,component$, useComputed$, useStore, useVisibleTask$ } from "@builder.io/qwik"
import { SimpleDialog, Close, useApp, AppStore } from "../dg"
import { H2, elipsis, personIcon } from "../theme"
import { Query , QueryBody, QueryResult, SimpleQueryBody, VirtualItem, newQuery} from "../query"
import { UserBasic } from "../login"
import { CleanupFn } from "../post/post"
import { Icon } from "../headless"
import { timeAgo } from "../post"
import { $localize } from "../i18n"

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
    return g.user.map((u,index)=> '@'+u.handle).join(', ')
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


// this should use group
function ContextMenu() {

    const Menu = ({pinned}: {pinned: boolean})=>{

        return <ul>
            <li class='hover:bg-neutral-800'>{pinned?$localize`Unpin`:$localize`Pin`}</li>
            <li class='hover:bg-neutral-800'>{$localize`Delete`}</li>
            </ul>
    }

    return <div class='absolute right-1 top-1 lg:hidden group-hover:block'>
        <Icon class='hover:text-blue-700 rounded-full hover:bg-neutral-500 block h-8 w-8' svg={elipsis}/>
        </div>

        
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

                    return <>
                    <div key={index} class='hover:bg-neutral-800 flex items-center relative group'>
                        <ContextMenu/>
                    <Icon class='block h-8 w-8' svg={personIcon}/>
                    <div class='flex flex-col w-full pl-1'>
                        <div class='mr-12 text-lg font:semi-bold'>{userList(item)} &nbsp;
                         <span class='text-stone-500 dark:text-gray-400'>{handleList(item)} {timeAgo(new Date(item.lastMessageTime))}</span></div>
                        <div class='text-sm'>{item.lastMessage}</div>
                    </div>
                    </div>
                    </>
                })}
            </SimpleQueryBody>
        </Query>
        </SimpleDialog>
})