

// streams can be voted, top first, bottom first.
// streams need to be found based on url.
// tool/id  # tool=status 
//  we can have "load more" top and bottom.

import { JSXNode, ResourceFn, ResourceOptions, component$, useStore } from "@builder.io/qwik"
import { JSX } from "@builder.io/qwik/jsx-runtime"

export interface QueryReturn<T> {

}
export function useQuery2$<T> (...query: any[])  {
    return {} as QueryReturn<any>
}

interface QuerySummary {
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
export interface QueryRow<ROW> {
    id: string
    // this may not be the complete row as long as we can compute the height another way. shifting heights will cause ux issues.
    data: ROW
    y: number
    x: number
}

// the query could have a column that represents x, or more commonly x may be associated with the attribute
// what about crosstabs? are these just adjustments to underlying sql?
// what about generation of the sql using sort, filter, etc.?
// what about moving/hiding columns? should this change the query?

export interface Database {

}



export interface QueryModel {
    
    params: any[]
    offset: number
    limit: number
}
export interface QueryResult<T> {
    db: Database
    opt: QueryModel
    rows: QueryRow<T>[]
    anchor: number
    length: number
    anchorOffset: number
}

export interface VProps<PROPS > {
    query: string
    params?: PROPS
}
export interface VisibleQueryResult<PROPS,ROW> {
    props: VProps<PROPS>
    row: ROW[]
    start: number
    length: number
}
// anchor is stored in user database.
// select * from table   anchor key1='drug'
// select array_agg(lat) where lng between 1 and 2 and zoom=15
// each field can have json/cbor shape.
// we need width-in/height out to be able to scroll.

export interface QuerySchema<PROPS, ROW> {

}
type Qfn = (props: VProps<any>) => void
export function useVisibleQuery$<PROPS, ROW>(fn: Qfn) : VisibleQueryResult<PROPS, ROW> {
    const props = useStore<VProps<PROPS>>({
        query: "",
    })
    fn(props)

    const r : VisibleQueryResult<PROPS, ROW> = {
        props: props,
        row: [],
        start: 0,
        length: 0
    }
    return useStore(r)
}

// render a row at a time, rows may be different heights.
// should work with a generic function/data source, not just sql?
// maybe this doesn't need to be a component? does it need a slot?
export const QueryRow = component$<{
    query: VisibleQueryResult<any,any>
}>(() => {
    return <></>
})

type ShowVq<T> = (data: T, y: number, context: Context ) => JSX.Element
export const QueryBody = component$<{
    query: VisibleQueryResult<any,any>
    // show has to be called for each row segment as we scroll.
    
    show: ShowVq<any>
}>((props) => {
    return <></>
})


// Only render the visible cells. rendertostring? store/signal for each cell?
// each row must have an X dimension.
// I don't want to use map? how can we not? qwik uses vdom.
export const Query2d = component$<{
    show: (data: any, x: number, y: number, context: Context ) => JSX.Element
}>((props) => {

    return <></>
})