
// query state is stored in the user database: scroll position, column arrangement, etc.
// per tab, but default to most recent change on any tab when starting a new tab.

// streams can be voted, top first, bottom first.
// streams need to be found based on url.
// tool/id  # tool=status 
//  we can have "load more" top and bottom.

import { $, JSXNode, QRL, Signal, Slot, component$, createContextId, useComputed$, useContext, useContextProvider, useSignal, useStore, useVisibleTask$ } from "@builder.io/qwik"
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
    const runway = useSignal<HTMLDivElement>()

      useResizeObserver(parentRef, $(()=>{
        console.log('resize', parentRef.value!.offsetHeight)
      }))

      useVisibleTask$(({ track }) => {
        track(()=>query.cache)
        parentRef.value?.addEventListener('scroll', (e)=>{
          console.log('scroll', parentRef.value!.scrollTop)
        })
        let start = query.averageHeight*query.cacheStart
        runway.value!.scrollTop = -100
        console.log('W',parentRef.value!.id, parentRef.value!.scrollTop,  start)
        let mh = 0
        for (let i = 0; i < query.item.length; i++) {
          query.item[i].start = start
          const el = runway.value!.children[i] as HTMLElement
          start += el.offsetHeight
          mh += el.offsetHeight
        }
        query.measuredHeight = mh
      })
 
      const totalHeight = useComputed$(()=> query.measuredHeight + (query.length - query.cache.length)*query.averageHeight)
        return <>
                  <div class='fixed z-40' >
          {query.averageHeight} {query.measuredHeight} {query.length} {query.cache.length} {totalHeight.value} {query.item[0]?.start} wtf{parentRef.value?.offsetHeight}fwt
          </div>
        <div id='wtf' class='h-full w-full overflow-auto' ref={parentRef}>

        <div ref={runway} style={{
            height: totalHeight.value+'px',
            width: '100%',
            position: 'relative'
        }}>
            { 
            query.item.map((row: VirtualItem,index: number) => { 
              return <div key={row.key} style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${row.start}px)`
              }}>{props.for(index)}</div>
            })
            }
        </div>
        </div>
        </>
})

  // }
