/* eslint-disable @typescript-eslint/no-unused-vars */


import { component$, createContextId, useContext, useContextProvider, useSignal, useStore, useVisibleTask$, $, QwikMouseEvent, useComputed$, Signal } from "@builder.io/qwik";
import { Icon } from "../headless";
import { bars_3, bubble, cart, pencil, search, tablet } from "./icon";
import { Search } from "./search";
import { $localize } from "../i18n";
import { Cart } from "./cart";
import { Share } from "./share";

// what if we take edit off the menu and make it a fab? problem is how do you switch back?





export const View = component$(() => {
    // minimized tab bar, no search
    return <div>View</div>
})


export const Edit = component$(() => {
    // half height dialog
    return <div>Edit</div>
})

// splitters should not download on mobile, only lazy load on desktop

export interface AppStore {
    tab: Signal<number>
}

const AppContext = createContextId<AppStore>("LAYOUT");
export function useApp() { return useContext<AppStore>(AppContext); }

export const SiteFooter = component$(() => {
    return <div>SiteFooter</div>
})

// how do we reference $ things here?
const toolData = [
    { name: "search", desc: $localize`Search`, svg: search },
    { name: "edit", desc: $localize`Edit`, svg: tablet },
    { name: "share", desc: $localize`Share`, svg: bubble },
    { name: "cart", desc: $localize`Cart`, svg: cart },
]

// switching to a tool can cause the content page to switch as well:
// message changes to most recent message
// search does not change immediately, but shows current file in context
// edit does not change
// cart has its own screen. 
const ToolDialog = component$(() => {
    const app = useApp()
    switch(app.tab.value) {
        case 1: return <Search/>
        case 2: return <Edit/>
        case 3: return <Share/>
        case 4: return <Cart/>
    }
    return <div/>
})

const ToolMain = component$(() => {
    return <div> Main</div>
})


// custom tools = javascript or cache personal html


const VRailIcon = (props: {selected: boolean, svg: string, onClick$: ()=>void})=> {
    return <div onClick$={props.onClick$} class='my-1 mb-4 w-full text-neutral-500 hover:text-white  border-blue-500 flex'
    style={{
        "border-left-width": props.selected? "2px": "2px",
        "border-left-color": props.selected? "white": undefined,
        "color": props.selected? "white": undefined
    }}
        >
    <Icon svg={props.svg} class='w-8 h-8  flex-1'   /></div>
}

// we should be able to use media query to layout the buttons initially and only use javascript if a button is clicked.s
// when loading statically we can assume 1 wide. We don't need to decide 1-2-3 wide until a menu is requested.
// splitters should not download on mobile, only lazy load on desktop
// we need to store locally for each tab?
export const PageTool = component$(() => {
    const isListen = useSignal(false)
    const x = useSignal(300) // width of left column

    const y = useSignal(300)
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

    const toggle = $((x: number) => {
        console.log("toggle", x, tab.value)
        if (x == tab.value)
            tab.value = 0
        else {
            tab.value = x
            y.value = Math.max(y.value, 400)
        }
    })
    const VRail = component$(() => {
        const VRailIcon = (props: {selected: boolean, svg: string, onClick$: ()=>void})=> {
            return <div onClick$={props.onClick$} class='my-1 mb-4 w-full text-neutral-500 hover:text-white  border-blue-500 flex'
            style={{
                "border-left-width": props.selected? "2px": "2px",
                "border-left-color": props.selected? "white": undefined,
                "color": props.selected? "white": undefined
            }}>
            <Icon svg={props.svg} class='w-8 h-8  flex-1'   /></div>
        }        
        return<div class=' w-12 flex flex-col items-center h-full  border-r-2 border-neutral-800 mr-1'>
            {toolData.map((x,i) => <VRailIcon key={x.name} selected={app.tab.value==i+1} svg={x.svg} onClick$={()=>toggle(i+1)} />)}
        </div>
    })
    const HRail = component$(() => {
        return <div>
            <div class='w-full flex items-center'>
                { toolData.map((x,i) => 
                 <div key={x.name}  class='flex flex-1 flex-col text-neutral-500 hover:text-blue-700 items-center ' style={{
                    "color": app.tab.value==i+1? "white": undefined
                 }}
                 onClick$={()=>toggle(i+1)}
                 >
                    <Icon svg={x.svg} class= 'w-6 h-6  flex-1 block' />
                    <div key={x.name} class='flex-1 text-center text-xs'>{x.desc}</div>
                 </div>)}
            </div></div>
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

    const leftSplit = $((e: QwikMouseEvent<HTMLDivElement, MouseEvent>) => {
        listenSize()
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

         { tab.value==0 && <VRail/>}
         { tab.value!=0 && <><div class='bg-neutral-900 hidden w-64  sm:flex'
            style={{
                width:  x.value + "px"
            }}>
            
                <VRail/>
         
            <div class='flex-1 '>
                <ToolDialog/>
            </div>
            <div
                onMouseDown$={leftSplit}
                class='h-full   cursor-ew-resize flex flex-col justify-center bg-neutral-900' >
                <button class='bg-neutral-800 rounded-full h-16 w-2 mr-1' />
            </div> 
        </div></>}

        <div class='flex-1 h-screen'>
            <div class='flex flex-col h-screen'>
                <div class='flex-1'><ToolMain/></div>

               
                    <div class='sm:hidden w-full  bg-neutral-900  rounded-t-lg bottom-0' onMouseDown$={bottomSplit}
                    style={{
                        height: (y.value) + "px",
                    }}>
                        <div class='h-4 flex justify-center'>
                            <button class='bg-neutral-800 rounded-full w-16 h-2 my-1' /></div>
                        <HRail/>
                        <ToolDialog/>
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