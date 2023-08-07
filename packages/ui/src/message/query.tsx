
// query state is stored in the user database: scroll position, column arrangement, etc.
// per tab, but default to most recent change on any tab when starting a new tab.

// streams can be voted, top first, bottom first.
// streams need to be found based on url.
// tool/id  # tool=status 
//  we can have "load more" top and bottom.

import { $, CSSProperties, JSXNode, NoSerialize, QRL, Signal, Slot, component$, createContextId, noSerialize, useComputed$, useContext, useContextProvider, useSignal, useStore, useVisibleTask$ } from "@builder.io/qwik"
import { DivProps } from "../tool/modal"
import { Virtualizer, elementScroll, observeElementOffset, observeElementRect, useVirtualizer } from "../virtual-qwik"
import { isServer } from "@builder.io/qwik/build"



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
    // maybe should be string key?
    anchorKey: any[]
    length: number
    averageHeight: number
    measuredHeight: number
    y: number[]
    offset: number
}
export function newQuery<T> () : QueryResult<T> {
    const r: QueryResult<T> = {
        row: [],
        y: [],
        anchorKey: [],
        offset: 0,
        length: 0,
        averageHeight: 96,
        plan: undefined,
        measuredHeight: 0
    }
    return r
}


export const Virtualize = component$<DivProps>((props) => {
    return <div class={props.class}>
        <Slot/>
        </div>
})

export const QueryContext = createContextId<QueryResult<any>>(
    'dg.query-context'
  );

// render a row at a time, rows may be different heights.
// should work with a generic function/data source, not just sql?
// maybe this doesn't need to be a component? does it need a slot?
export const Query = component$<{
    query: QueryResult<any>
}>((props) => {
    useContextProvider(QueryContext, props.query)
    return <Slot/>

})

 
type Qbp = {
    for: (index: number) => JSXNode
}

// export function useVirtual(options: {}){
//     const st = useStore({
//         parentRef: useSignal<HTMLDivElement>(),
//         totalSize: 0,

//     })

//     return st
// }
// virtualize
type TScrollElement = Element|Window;
type TItemElement = HTMLElement;
export const QueryBody = component$<Qbp>((props) => {
    const query = useContext(QueryContext)

    const parentRef = useSignal<HTMLDivElement>()
    const rowVirtualizer = useVirtualizer({
        count: query.row.length,
        getScrollElement: () => parentRef.value??null,
        estimateSize: () => query.averageHeight,
      });


    //const items = useSignal<HTMLDivElement>()

    // const height = useComputed$(() => {
    //     return query.measuredHeight + (query.length - query.row.length)*query.averageHeight
    // })

    // const vstyle = (index: number) => {
    //     return {
    //         position: 'absolute',
    //         transform: `translateY(${query.y[index]}px)`,
    //         top: 0,
    //         left: 0,
    //         width: '100%'

    //     }
    // }

    // set up intersection observer, scroll event handlers.
    // const v = useVirtual({
    //     size: query.length,
    //     parentRef: items,
    //     estimateSize: query.averageHeight,
    //     overscan: 5,

    // })

    // interface Vrow {
    //     key: string
    //     index: number
    //     style: CSSProperties
    // }

    // const vmap = () : Vrow[] => {
    //     let y = 0
    //     const r=  query.row.map((row, index) => {
    //         const r = {
    //             key: (index+query.offset)+"",
    //             index: index+query.offset,
    //             style: {
    //                 position: 'absolute' as any,
    //                 top: 0,
    //                 left: 0,
    //                 width: '100%',
    //                 height: `${32}px`,
    //                 transform: `translateY(${y}px)`,
    //             }
    //         }
    //         y += 48
    //         return r
    //     })
    //     console.log(r)
    //     return r
    // }

    const fubar = $(()=>{
        return <div class='h-full w-full overflow-auto' ref={parentRef}>

        <div  style={{
            height: rowVirtualizer.value!.getTotalSize()+'px',
            width: '100%',
            position: 'relative'
        }}>
            { rowVirtualizer.value!.getVirtualItems().map((row) => {
                return <div key={row.key} 
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${row.size}px`,
                    transform: `translateY(${row.start}px)`,
                  }}
                >WTF {row.index}</div>
            })}
        </div>
        </div>
    })

    return <>{ rowVirtualizer.value && fubar() }</>
})

// we can't really merge dynamically and still have random access.
// we can't be guaranteed that we can fit the entire timeline. so we are left with a materialized timeline that goes back in time dynamically.
// yan cun: all data will be mediated by ai assistant. 
interface Btree {

}

/*
        <div ref={d} class='absolute h-[1px] w-[1px]' style={{
            transform: `translateY(${height.value}px)`,
             transition: `transform 0.2s`
        }}> </div>
*/

/*
        { 
        })}
*/

/*
    // how do we know when to measure?
    // qwik won't render right away, so measurements might need a tick?

    useVisibleTask$(({track})=>{
        track(()=>query.row) // run every time the row changes
        track(()=>query.length)
        track(()=>query.offset)

        // let h = 0
        // for (let i = query.row.length; i < query.length; i++) {
        //     const ch = items.value!.children[i]
        //     h += (ch as HTMLElement).offsetHeight
        // }
        // query.measuredHeight = h
        // we need to determine how to 
        const dx = query.row.map((row, index) => {
            return <div key={index} style={{
                position: 'absolute',
                transform: `translateY(${query.y[index]}px;`,
            }}>{props.for(index)}</div>
        })

        for (let i = 0; i<dx.length; i++) {
            console.log(renderToString(dx[i],{manifest}))
        }
    })
*/

export function useResizeObserver(
    element: Signal<HTMLElement | undefined>,
    onResize: QRL<() => void>
  ) {
    useVisibleTask$(({ track }) => {
      track(() => element.value);
  
      let rAF = 0;
      if (element.value) {
        const resizeObserver = new ResizeObserver(() => {
          cancelAnimationFrame(rAF);
          rAF = window.requestAnimationFrame(onResize);
        });
        resizeObserver.observe(element.value);
  
        return () => {
          window.cancelAnimationFrame(rAF);
          if (element.value) {
            resizeObserver.unobserve(element.value);
          }
        };
      }
    });
  }