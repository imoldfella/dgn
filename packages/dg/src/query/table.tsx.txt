
import { faker } from '@faker-js/faker'
import { BuilderFn, Column, enableColumnResizing, EstimatorFn, Scroller, ScrollerProps, TableContext } from './scroll'
import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik'


// one kind of 

// global css class?
const redFrame = "border-solid border-2 border-red-500"
const greenFrame = "border-solid border-2 border-green-500"
const clearFrame = "border-solid border-0 border-opacity-0"




// tables need a header
// all pages need an info box.
// we probably need terminal to work
export const  TableViewer = component$(()=> {
    const el = useSignal< HTMLDivElement>()
    const  tombstone = useSignal< HTMLDivElement>()
  
    const N = 100
    const c : Column[] = []
    for (let i = 0; i < N; i++) {
        c.push({ tag: i, width: 96, html: "col" + i  })
    }

    useVisibleTask$( () => {
        if (!tombstone.value) return
        const tombstoneHeight_ = tombstone.value.offsetHeight
        tombstone.value.style.display = 'none'

        const est: EstimatorFn = (start: number, end: number) => {
            const r = (end - start) * 24
            //console.log("est", start, end, tombstoneHeight_, r)
            return r
        }

        const bld: BuilderFn = (ctx: TableContext) => {
            const f = <p class='p-4'>{ctx.row},{ctx.column.tag}</p>
            ctx.render(f)
        }

        const props: ScrollerProps = {
            container: el!.value!,
            row: {
                count: N
            },
            column: {
                header: c,
            },
            builder: bld,
            height: est,
        }
        const s = new Scroller(props)
    })

    return <>
        <div class={'h-full w-full absolute ' + clearFrame} ref={el!}></div>
        <p ref={tombstone!}>&nbsp;</p>
    </>

})


