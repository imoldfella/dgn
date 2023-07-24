
// the menu can be pre-rendered. are there dynamic components though?
// search might be a better place for recent files.
// the menu might be personalized per role; how do we do that?
// if we look at the cookie in entry? we need to build this as a container then?
// I think localization should be orthogonal, and then extract the toc for each language.
// then it can fallback normally.

import { component$, useComputed$, $, useStore, Slot } from "@builder.io/qwik"
import { Segmented, chevronDown, chevronRight } from "../theme"
import { useLocation, useNavigate } from "../provider"
import { Icon } from "../headless"

export interface TocData {
    name: string
    path?: string   // if no path than must have a child, uses path of first child
    children?: TocData[]
}

// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const Dialog = component$(() => {
    return <div class='p-1 border-l border-l-neutral-500 h-full'>
        <Slot />
    </div>
})

// we could generalize this to any number of nested tab sets.
export const TocTabbed = component$<{ toc: TocData[] }>((props) => {
    const pathx = useLocation()
    const nav = useNavigate()

    const changeTab = $((index: number) => {
        const base = pathx.url.split("/").slice(0, 2).join("/")
        nav(base + props.toc[index].path ?? "/")
    })

    const tabn = useComputed$<[number, string]>(() => {
        const path = pathx.url.split("/")
        for (let i = 0; i < props.toc.length; i++) {
            if (props.toc[i].path === path[2]) return [i, path.slice(1).join("/")]
        }
        return [0, "/"]
    })
    // the top could be a segment control
    const values = useComputed$(() => props.toc.map((e) => e.name))

    // this would be easier in solid? we need to navigate when the signal changes.
    return <Dialog>
        <Segmented values={values.value} selected={tabn.value[0]} onChange$={changeTab} />
        <Toc open={2} path={tabn.value[1]} toc={props.toc[tabn.value[0]]} />
    </Dialog>
})

export const Toc = component$<{ open?: number, path: string, toc: TocData, level?: number }>((props) => {
    const cls = `ml-${2 * (props.level ?? 0)}`
    const open = props.open === undefined ? 0 : props.open - 1
    const def: Record<number, boolean> = {}
    for (let i = 0; i < (props.toc.children?.length ?? 0); i++) {
        def[i] = open > 0
    }
    const state = useStore<{
        expanded: Record<number, boolean>
    }>({ expanded: def })

    return <>
        {(props.toc.children ?? []).map((item, index) => {
            return <>
                <div class='flex items-center'>
                    <div class={cls} key={item.name}>{item.name}</div>
                    {item?.children?.length && <Icon onClick$={() => { state.expanded[index] = !state.expanded[index] }} svg={state.expanded[index] || open > 0 ? chevronDown : chevronRight} class='ml-1 w-3 h-3 hover:text-blue-500' />}</div>
                {state.expanded[index] && <Toc open={open} path={props.path + "/" + item.path} toc={item} level={(props.level ?? 0) + 1} />}
            </>
        })}
    </>
})
