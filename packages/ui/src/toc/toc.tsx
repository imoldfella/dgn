
// the menu can be pre-rendered. are there dynamic components though?
// search might be a better place for recent files.
// the menu might be personalized per role; how do we do that?
// if we look at the cookie in entry? we need to build this as a container then?
// I think localization should be orthogonal, and then extract the toc for each language.
// then it can fallback normally.

import { component$, useComputed$, $ } from "@builder.io/qwik"
import { Segmented } from "../theme"
import { useLocation, useNavigate } from "../provider"

export interface TocData {
    name: string
    path?: string   // if no path than must have a child, uses path of first child
    children?: TocData[]
}

// we could generalize this to any number of nested tab sets.
export const TocTabbed = component$<{ toc: TocData[]  }>((props)=>{
    const pathx = useLocation()  
    const nav = useNavigate()

    const changeTab = $((index: number) => {
        nav("/" + index)
    })

    const tabn = useComputed$<[number,string]>(()=> {
        const path = pathx.url.split("/")
        for (let i=0; i<props.toc.length; i++) {
            if (props.toc[i].path === path[2]) return [i, path.slice(1).join("/")]
        }
        return [0,"/"]
    })
    // the top could be a segment control
    const values = useComputed$(() => props.toc.map((e) => e.name))


    // this would be easier in solid? we need to navigate when the signal changes.
    return <>
        <div>{pathx.url},{tabn.value[1]}</div>
        <Segmented values={values.value} selected={tabn.value[0]} onChange$={changeTab}/>
        <Toc open={2} path={tabn.value[1]} toc={props.toc[tabn.value[0]]}/>
    </>
})

export const Toc = component$< {open?: number, path: string, toc: TocData, level?: number  } >((props)=> {
    const cls = `ml-${2*(props.level??0)}`
    const open = props.open === undefined? 0: props.open-1
    return <>
        { (props.toc.children??[]).map((item)=> {
            return <>
                <div class={cls} key={item.name}>{item.name}</div>
                { open > 0 && <Toc open={open} path={props.path + "/" + item.path} toc={item} level={(props.level??0)+1} /> }
                </>
        })}
    </>
})
