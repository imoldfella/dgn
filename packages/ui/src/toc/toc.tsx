
// the menu can be pre-rendered. are there dynamic components though?
// search might be a better place for recent files.
// the menu might be personalized per role; how do we do that?
// if we look at the cookie in entry? we need to build this as a container then?
// I think localization should be orthogonal, and then extract the toc for each language.
// then it can fallback normally.

import { Signal, component$, useComputed$, useSignal } from "@builder.io/qwik"
import { Segmented } from "../theme"
import { useNavigate } from "../provider"

interface TocData {
    name: string
    path: string
    children?: TocData[]
}

// we could generalize this to any number of nested tab sets.
export const TocTabbed = component$<{path: string, toc: TocData[],  }>((props)=>{

    const nav = useNavigate()

    const tabn = useComputed$<[number,string]>(()=> {
        const path = props.path.split("/")
        for (let i=0; i<props.toc.length; i++) {
            if (props.toc[i].path === path[0]) return [i, path.slice(1).join("/")]
        }
        return 0
    })
    // the top could be a segment control
    const values = useComputed$(() => props.toc.map((e) => e.name))


    // this would be easier in solid? we need to navigate when the signal changes.
    return <>
        <Segmented values={values.value} onChange$={
            // nav will always add the language
            // do we lose our place on the tabs, or keep them?
            nav("/"+props.path.split('/')[0])
         } />
        <Toc path={tabn.value[1]} toc={props.toc[tabn.value[0]]}/>
    </>
})

export const Toc = component$< {path: string, toc: TocData } >((props)=> {

    return <>
        { (props.toc.children??[]).map((item)=> {
            return <div key={item.name}>{item.name}</div>
        })}
    </>
})
