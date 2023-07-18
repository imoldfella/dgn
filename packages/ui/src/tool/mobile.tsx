/* eslint-disable @typescript-eslint/no-unused-vars */


import { component$, createContextId, useContext, useContextProvider, useSignal, useStore, useVisibleTask$, $, QwikMouseEvent, useComputed$, Signal } from "@builder.io/qwik";
import { Icon } from "../headless";
import { bars_3, bubble, pencil, search } from "./icon";


// splitters should not download on mobile, only lazy load on desktop

export interface AppStore {
    tab: Signal<number>
}

const AppContext = createContextId<AppStore>("LAYOUT");
export function useApp() { return useContext<AppStore>(AppContext); }

export const SiteFooter = component$(() => {
    return <div>SiteFooter</div>
})

export const Search = component$(() => {
    return <div>Search</div>
})

// custom tools = javascript or cache personal html
const HRail = component$(() => {
    return <div>
        <div class='w-full flex items-center'>
            <Icon svg={search} class='w-6 h-6  flex-1 block' />
            <Icon svg={pencil} class='w-6 h-6 flex-1 block' />
            <Icon svg={bubble} class='w-6 h-6 flex-1 block' />
        </div>
        <div class='w-full flex text-xs items-center'>
            <div class='flex-1 text-center'>Search</div>
            <div class='flex-1 text-center'>Edit</div>
            <div class='flex-1 text-center'>Chat</div>
            </div>
        </div>
})

const VRailIcon = (props: {selected: boolean, svg: string, onClick$: ()=>void})=> {
    return <div onClick$={props.onClick$} class='my-1 w-full  border-blue-500 flex'
    style={{
        "border-left-width": props.selected? "2px": "0px",
        "color": props.selected? "white": "#eee"
    }}
        >
    <Icon svg={props.svg} class='w-8 h-8 mb-2 flex-1'   /></div>
}
const VRail = component$(() => {
    const app = useApp()

    const toggle = $((x: number) => {

    })
    return <>
             <VRailIcon selected={app.tab.value==1} svg={search} onClick$={()=>toggle(0)} />
             <VRailIcon selected={app.tab.value==2} svg={pencil} onClick$={()=>toggle(1)}/>
             <VRailIcon selected={app.tab.value==3} svg={bubble} onClick$={()=>toggle(1)}/>
        </>

})

// we should be able to use media query to layout the buttons initially and only use javascript if a button is clicked.s
// when loading statically we can assume 1 wide. We don't need to decide 1-2-3 wide until a menu is requested.
// splitters should not download on mobile, only lazy load on desktop
// we need to store locally for each tab?
export const PageTool = component$(() => {
    const isListen = useSignal(false)
    const x = useSignal(300) // width of left column

    const toolSet = useSignal(0)

    const y = useSignal(64)
    const width = useSignal(0)
    const height = useSignal(0)

    // should this be part of the url?
    const tab = useSignal(1)

    const app = useStore<AppStore>({
        tab
    })
    useContextProvider(AppContext, app);

    const listenSize = $(() => {
        if (isListen.value) return
        isListen.value = true
        width.value = window.innerWidth
        height.value = window.innerHeight
        //if (width.value > 680) desktop.value = true
        window.addEventListener('resize', () => {
            width.value = window.innerWidth
            height.value = window.innerHeight
            //desktop.value = width.value > 680
        })
    })

    const bottomSplit = $((e: QwikMouseEvent<HTMLDivElement, MouseEvent>) => {
        const start = e.clientY
        const starty = y.value
        const move = (e: MouseEvent) => {
            //y.value = Math.max(0,(e.clientY-start))  // X if 
            y.value = Math.max(64, starty + (start - e.clientY))
        }
        const up = (e: MouseEvent) => {
            window.removeEventListener("mousemove", move)
            window.removeEventListener("mouseup", up)
        }
        window.addEventListener("mousemove", move)
        window.addEventListener("mouseup", up)
    })
    const toggleTools = $((x: number) => {
        if (x == toolSet.value)
            toolSet.value = 0
        else {
            toolSet.value = x
            y.value = Math.max(y.value, 400)
        }
    })
    const leftSplit = $((e: QwikMouseEvent<HTMLDivElement, MouseEvent>) => {
        const start = e.clientX - x.value
        const move = (e: MouseEvent) => {
            x.value = (e.clientX - start)
        }
        const up = (e: MouseEvent) => {
            window.removeEventListener("mousemove", move)
            window.removeEventListener("mouseup", up)
        }
        window.addEventListener("mousemove", move)
        window.addEventListener("mouseup", up)
    })

    const debug = useComputed$(() => {
        return JSON.stringify({
            x: x.value,
            y: y.value,
            width: width.value
        })
    })

    return <div class='flex h-screen w-screen fixed overflow-hidden'>

         <div class='bg-neutral-900 hidden w-64  sm:flex'
            style={{
                width: x.value + "px"
            }}>
            <div class=' w-12 flex flex-col items-center '>
                <VRail/>
            </div>
            <div class='flex-1 border-l-2 border-neutral-800'><Search /></div>
            <div
                onMouseDown$={leftSplit}
                class='h-full   cursor-ew-resize flex flex-col justify-center bg-neutral-900' >
                <button class='bg-neutral-800 rounded-full h-16 w-2 mr-1' />
            </div>
        </div>

        <div class='flex-1 h-screen'>
            <div class='flex flex-col h-screen'>
                <div class='flex-1'>main</div>

               
                    <div class='sm:hidden w-full  bg-neutral-900  rounded-t-lg bottom-0' onMouseDown$={bottomSplit}
                    style={{
                        height: (y.value) + "px",
                    }}>
                        <div class='h-4 flex justify-center'>
                            <button class='bg-neutral-800 rounded-full w-16 h-2 my-1' /></div>
                        <HRail/>
                    </div>
                
            </div>
        </div>


    </div>
})



const MessageEditor = component$(() => {
    return <div class='w-full'>
           <Icon svg={bars_3} class='w-6 h-6 block' />
           <div contentEditable="true" class='flex-1 rounded-lg border-1 border-blue-700'/>
        </div>
})