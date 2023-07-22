/* eslint-disable @typescript-eslint/no-unused-vars */


import { component$, createContextId, useContext, useContextProvider, useSignal, useStore, useVisibleTask$, $, QwikMouseEvent, useComputed$, Signal, useTask$ } from "@builder.io/qwik";
import { Icon } from "../headless";
import { bars_3, bubble, cart, pencil, search, tablet } from "./icon";
import { Search } from "./search";
import { $localize, xCircle } from "../i18n";
import { Cart } from "./cart";
import { Share } from "./share";
import { useLocation } from "../provider";
import { renderToStream, renderToString } from "@builder.io/qwik/server";
import { renderJson } from "./render";


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
    y: Signal<number>
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

const Hello = component$(() => {
    return <div>Hello</div>
})

const ToolMain = component$( () => {
    const content = useSignal("<div>hello</div>")
    // track the location? when the location changes we need to reload the content.
    // the server won't get the new request.
    const loc = useLocation()
    useTask$(async ({track}) => {
        track(()=> loc.url)
        console.log("ToolMain", loc.url)
        content.value = await renderJson({})

        // should I use render here? I need to work like a playground
        // as a start we could load the lexical json here and render it.
        // then each <link> page sould fetch only the lexical json and client side render it. this is smaller than even the editor, and maybe equivalent to html. It can be loaded from a btree. loading assets from a btree involves tradeoffs; we'd like them to be local, but then they can't be shared. how should we divide these cases? Seems like the bigger it is, the less likely it is to be reused?

        // we should fetch the precompiled html here? it might not be precompiled. SSR support suggests we might have to execute it to get the state. we can allow that to edit, we have the entire program offline. but we get here even if we are not editing. so in that case we want to use a cache and quickly get back to the user. if we inject the content from the top down does it give us faster access to rust?

        // can I use renderToStream here, together with innerHtml?
        // const s = await renderToString(<Hello/>, {

        // })
        //content.value = s.html
        //console.log("rendered", s)

        // first fetch as viewable? but can it embed qrls? maybe it can only embed routes? why not embed components though? maybe this needs to be a container. A container with available source.
        //content.value = await (await fetch("/assets/content.html")).text()
        // build every page as its own qwik app? that sounds inefficient.
        // do we need to compile the content page jit? I guess when we save it we can compile it, incrementally so that we don't have to compile the whole thing. potentially one page independently, then after a few pages recompile to get sharing? in any event what we get here is html. we might have to execute it on a "server" to get it though. It could be a fetch, or it could be a 

    })
    return <div dangerouslySetInnerHTML={content.value} />
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

    const y = useSignal(64)
    const width = useSignal(0)
    const height = useSignal(0)

    // should this be part of the url?
    const tab = useSignal(0)
    const app = useStore<AppStore>({
        tab,
        y: y
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
        <div class='flex-1 h-screen hidden sm:block'>
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
        </div>
        <div class='flex-1 h-screen'>
            <div class='flex flex-col h-screen'>
                <div class='flex-1'><ToolMain/></div>

               
                    <div class='sm:hidden w-full  bg-neutral-900  rounded-t-lg bottom-0' onMouseDown$={bottomSplit}
                    style={{
                        height: (y.value) + "px",
                    }}>
                        <div class='h-4 flex justify-center'>
                            <button class='bg-neutral-800 rounded-full w-16 h-2 my-1' /></div>
                        { tab.value==0 && <HRail/> }
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

function close(app: AppStore) {
    app.tab.value = 0
    app.y.value = 64
}
    
export const Close = component$(()=> {
    const app = useApp()
  
   return <Icon svg={xCircle} class='h-8 w-8 text-blue-500 hover:text-blue-700'  onClick$={()=>close(app) }/>
})