
// query state is stored in the user database: scroll position, column arrangement, etc.
// per tab, but default to most recent change on any tab when starting a new tab.

// streams can be voted, top first, bottom first.
// streams need to be found based on url.
// tool/id  # tool=status 
//  we can have "load more" top and bottom.

import { $, JSXNode, QRL, Signal, Slot, component$, createContextId, useContext, useContextProvider, useSignal, useStore, useVisibleTask$ } from "@builder.io/qwik"
import { DivProps } from "../tool/modal"
import { UserPost } from "./post"



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
export interface VirtualItem {
    key: string
    index: number
    start: number
    end: number
    size: number
    lane: number
  }

export interface QueryPlan {
    // these things should be sent to the worker?
    plan?: CorePlan
    select?: number[]
    orderby?: number[]
    filter?: string
}    
  
// this is a store that we change when the the worker sends updates
export interface QueryResult<ROW> {
    length: number  // total number of rows in result
    cacheStart: number
    cache: ROW[]
    // the value here will depend on the sort order
    // maybe should be string key?

    anchorKey: any[]

    averageHeight: number
    measuredHeight: number
    item: VirtualItem[]
}
export function newQuery<T> () : QueryResult<T> {
    const r: QueryResult<T> = {
        cache: [],
        item: [],
        anchorKey: [],
        cacheStart: 0,
        length: 0,
        averageHeight: 96,
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
type TScrollElement = Element|Window;
type TItemElement = HTMLElement;
export const QueryBody = component$<Qbp>((props) => {
    const query = useContext<QueryResult<UserPost>>(QueryContext)
    const parentRef = useSignal<HTMLDivElement>()

      useResizeObserver(parentRef, $(()=>{
        console.log('resize', parentRef.value!.offsetHeight)
      }))
 
        return <div class='h-full w-full overflow-auto' ref={parentRef}>
        <div  style={{
            height: (query.length*query.averageHeight)+'px',
            width: '100%',
            position: 'relative'
        }}>
            <div class='absolute w-full' style={{
                transform: `translateY(${query.cacheStart*query.averageHeight}px)`,
            }}/>
            { query.cache.map((row: UserPost,index: number) => props.for(index))}
        </div>
        </div>
})

// we can't really merge dynamically and still have random access.
// we can't be guaranteed that we can fit the entire timeline. so we are left with a materialized timeline that goes back in time dynamically.
// yan cun: all data will be mediated by ai assistant. 
interface Btree {

}

/*
            { query.row.map((row: UserPost,index: number) => {
                return <div key={index} 
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${32}px`,
                    transform: `translateY(${index*32}px)`,
                  }}
                >WTF {index}</div>
            })}
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
    const rowVirtualizer = useStore({
        count: query.row.length,
        row: query.row.map((e: UserPost,index: number) => {
            const a: VirtualItem = {
                key: e.id,
                index: index,
                start: 0,
                end: 0,
                size: 0,
                lane: 0
            } 
            return a
        }),
        totalSize: query.averageHeight * query.length,
      });


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
