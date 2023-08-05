

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
    error: { message: string }
    data: T[]
  
}
export interface Context {
    min: number,
    max: number
}
type ShowFn<T> = (data: T, x: number, y: number, context: Context ) => JSX.Element


// should this call a function for an entire list of components, or for each component? How should we handle bonus space.

type QueryProps<T> = {
    value: QueryReturn<T>
    show: ShowFn<T>
    onRejected: (error: any) => JSXNode
}
export  function Query<T>(props: QueryProps<T>) : JSXNode {
    return props.onRejected({message: "not implemented"})
}
//export declare const Query: <T>(props: ResourceProps<T>) => JSXNode;

export declare const useQuery$: <T>(generatorFn: ResourceFn<T>, opts?: ResourceOptions) => QueryReturn<T>;
