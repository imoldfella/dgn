

// streams can be voted, top first, bottom first.
// streams need to be found based on url.
// tool/id  # tool=status 
//  we can have "load more" top and bottom.

import { JSXNode, ResourceFn, ResourceOptions, component$ } from "@builder.io/qwik"
import { JSX } from "@builder.io/qwik/jsx-runtime"

export interface QueryReturn<T> {

}
export function useQuery2$<T> (...query: any[])  {
    return {} as QueryReturn<any>
}

export interface QuerySummary {

}

type ShowFnProps<T> = {
    before: QuerySummary,
    end: QuerySummary,
    //error: { message: string }
    data: T[]
  
}
export interface Context {
    min: number,
    max: number
}
type ShowFn<T> = (data: T, x: number, y: number, context: Context ) => JSX.Element


// should this call a function for an entire list of components, or for each component? How should we handle bonus space.

type QueryProps<T> = {
    id: string
    value: QueryReturn<T>
    show: ShowFn<T>
    //onRejected: (error: any) => JSXNode
}
export  function Query<T>(props: QueryProps<T>) : JSXNode|null {
    //return props.onRejected({message: "not implemented"})
    return null
}
//export declare const Query: <T>(props: ResourceProps<T>) => JSXNode;

export declare const useQuery$: <T>(generatorFn: ResourceFn<T>, opts?: ResourceOptions) => QueryReturn<T>;


// why not an error boundary, e.g. providing toast?

// rows are a thing, because for most tables we need to be able to determine the height by formatting the entire row. 
interface QueryRow<T> {
    id: string
    // this may not be the complete row as long as we can compute the height another way. shifting heights will cause ux issues.
    data: T[]
    y: number
    x: number
}

interface QueryResult<T> {
    front: 
    rows: QueryRow<T>[]
}