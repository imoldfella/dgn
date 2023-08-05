

// streams can be voted, top first, bottom first.
// streams need to be found based on url.
// tool/id  # tool=status 
//  we can have "load more" top and bottom.

import { component$ } from "@builder.io/qwik"
import { JSX } from "@builder.io/qwik/jsx-runtime"

export interface QueryReturn<T> {

}
export function useQuery$<T> (...query: any[])  {
    return {} as QueryReturn<any>
}

export interface QuerySummary {

}

type ShowFnProps<T> = {
    before: QuerySummary,
    end: QuerySummary,
    error: { message: string }
    data: T[]
 }
type ShowFn<T> = (props: ShowFnProps<T> ) => JSX.Element


// should this call a function for an entire list of components, or for each component? How should we handle bonus space.

type QueryProps<T> = {
    value: QueryReturn<any>
    show: ShowFn<T>
}
export const Query = component$<QueryProps<T>>((props) => { return null})
