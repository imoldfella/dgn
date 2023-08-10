import { $,component$, useStore } from "@builder.io/qwik"
import { SimpleDialog, Close } from "../tool"
import { H2 } from "../theme"
import { Query , QueryBody, QueryResult, newQuery} from "../query"
import { UserBasic } from "../login"

interface Group {
    user: UserBasic[]
    lastMessage: string
}

  export   const GroupItem = component$((props: {index: number})=>{
        return <div class='flex items-center'>yo</div>
    })
export const DmList = component$(()=>{
    const q: QueryResult<Group> = useStore(newQuery())
    return <SimpleDialog>
        <Close/>
        <H2>Messages</H2>
        <Query query={q}>
            <QueryBody for={$((index: number)=>{
                return <GroupItem index={index}/>
            })} />
        </Query>
        </SimpleDialog>
})