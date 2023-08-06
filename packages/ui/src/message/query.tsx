
// query state is stored in the user database: scroll position, column arrangement, etc.
// per tab, but default to most recent change on any tab when starting a new tab.

// streams can be voted, top first, bottom first.
// streams need to be found based on url.
// tool/id  # tool=status 
//  we can have "load more" top and bottom.

import { $, JSXNode, ResourceFn, ResourceOptions, Slot, component$, useSignal, useStore, useVisibleTask$ } from "@builder.io/qwik"
import { JSX } from "@builder.io/qwik/jsx-runtime"
import { DivProps } from "../tool/modal"

export interface QueryReturn<T> {

}
export function useQuery2$<T> (...query: any[])  {
    return {} as QueryReturn<any>
}
export function scrollPosition(url: string) : number[]{
    return [0]
}
export function setScrollPosition(url: string, index: number[]) : void {

}

// query plans can be altered by the user: sort, filter, etc.
// localization is ?. does it require a new query plan? is there a core plan that we can modify with all localization?
export interface Column {
    name: string

}

// the core plan is a view pre-built for business logic
export interface CorePlan {

}

export interface VProps<PROPS > {

}

// export interface QueryResult<T> {
//     db: Database
//     opt: QueryModel
//     rows: QueryRow<T>[]
//     anchor: number
//     length: number
//     anchorOffset: number
// }
export interface QueryResult<ROW> {
    plan?: CorePlan
    select?: number[]
    orderby?: number[]
    filter?: string
    row: ROW[]
    // the value here will depend on the sort order
    start: any[]
    length: number
    averageHeight: number
}
export function newQuery<T> () : QueryResult<T> {
    const r: QueryResult<T> = {
        row: [],
        start: [],
        length: 0,
        averageHeight: 96,
        plan: undefined
    }
    return r
}


export const Virtualize = component$<DivProps>((props) => {
    return <div class={props.class}>
        <Slot/>
        </div>
})

// render a row at a time, rows may be different heights.
// should work with a generic function/data source, not just sql?
// maybe this doesn't need to be a component? does it need a slot?
export const Query = component$<{
    query: QueryResult<any>
}>((props) => {
    return <Slot/>

})

// virtualize
export const QueryBody = component$<{
   
    // const d = document.createElement('div');
    // d.textContent = ' ';
    // d.style.position = 'absolute';
    // d.style.height = '1px';
    // d.style.width = '1px';
    // d.style.transition = 'transform 0.2s';
    // this.scroller_.appendChild(d);

    // show has to be called for each row segment as we scroll.
}>((props) => {
    const d = useSignal<HTMLDivElement>()

    useVisibleTask$(({track}) => {
        // const d = document.createElement('div');
        // d.textContent = ' ';
        // d.style.position = 'absolute';
        // d.style.height = '1px';
        // d.style.width = '1px';
        //d.style.transition = 'transform 0.2s';
        d.style.transform = `translateY(${props.query.start[0] * props.query.averageHeight}px)`;
    })

    return <div>
        <div ref={d} class='absolute h-[1px] w-[1px]' style='transition: transform 0.2s'> </div>
        <Slot/>
        </div>
})



