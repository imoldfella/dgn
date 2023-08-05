

// streams can be voted, top first, bottom first.
// streams need to be found based on url.
// tool/id  # tool=status 
//  we can have "load more" top and bottom.

import { component$ } from "@builder.io/qwik"
import { JSX } from "@builder.io/qwik/jsx-runtime"

export interface QueryReturn<T> {

}
export const useQuery$ = (query: string) => {
    return {} as QueryReturn<any>
}

export interface QuerySummary {

}

type ShowFnProps = {
    before: QuerySummary,
    end: QuerySummary,
    error: { message: string }
 }
type ShowFn = (props: ShowFnProps ) => JSX.Element


// should this call a function for an entire list of components, or for each component? How should we handle bonus space.

type QueryProps = {
    value: Promise<QueryReturn<any>>
    show: ShowFn
}
export const Query = component$<QueryProps>((props) => { return null})
