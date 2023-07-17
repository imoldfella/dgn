/* eslint-disable @typescript-eslint/no-unused-vars */


import {  Signal, Slot, component$, createContextId, useContext, useContextProvider,useSignal,useStore, useVisibleTask$, $ } from "@builder.io/qwik";
import { Icon } from "../headless";
import { Cellify } from "./cell";
import { Editor } from "../lexical/lexical";


// splitters should not download on mobile, only lazy load on desktop

// maybe the client only stuff should be part of a useStore? eventually the server may want influence in the layout.
const ld =  {
    leftSplitter: 0,
    rightSplitter: 0,
    middleSplitter: 0,
    width: 0,
    height: 0,
}
type LayoutData = typeof ld
// interface LayoutData {
//     leftSplitter: number
//     rightSplitter: number
//     middleSplitter: number
//     showLeft: boolean
//     showRight: boolean
//     showBottom: Boolean
//     width: number
//     height: number
// }
export type LayoutStruct = Cellify<LayoutData>


export interface AppStore {
    //layout: LayoutStruct
    // these things should be part of the server
    showSearch: Signal<boolean>,
    showTools: Signal<boolean>,
    showBottom: Signal<boolean>,
    desktop: Signal<boolean>,
    y: Signal<number>
}

const AppContext = createContextId<AppStore>("LAYOUT");
export function useApp() { return  useContext<AppStore>(AppContext); } 

export const SiteFooter = component$(()=>{
    return <div>SiteFooter</div>
})



export const bars_3 = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
</svg>`
export const menuv = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
<path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
</svg>`

// can share with desktop?
const TopTools = component$(() => {
    const app = useApp()
    return <div class='bg-black text-md absolute w-full items-center flex px-1 bg-neutral-900' style={{
        top: "0px",
        height: "32px",
    }}>
        <Icon svg={bars_3} onClick$={()=>{app.showSearch.value = !app.showSearch.value} } /><div class='flex-1 text-md ml-2 '>Title here</div>
        <Icon svg={menuv} onClick$={()=>{app.showTools.value = !app.showTools.value}} />
    </div>
})

// we might have standard modal's in here
// we will only have either left or right open at a time
// if the screen is wide enough it will split, if not it will overlay

// the tool pane should have a an outer rail of tabs that can be configured. this might be optional for 

// it makes sense to show the panes half way up, draggable
// custom modals will need to pick
// so then they aren't quite modals? will tapping in the content area dismiss them?
// not necessarily

// we should only load lexical when user clicks on the editor.
export const Search = component$(()=>{
    return <Editor/>
    
})

export const TextBlock = component$(()=>{
    return <div>TextBlock</div>
})

// the block list may not be fully editable; in a chat you can't always edit someone elses message. You might be able to if you are on the same team though or admin redacting something.
export const BlockList = component$(()=>{
    return <div>BlockList</div>
})

// when loading statically we can assume 1 wide. We don't need to decide 1-2-3 wide until a menu is requested.
// splitters should not download on mobile, only lazy load on desktop
// we need to store locally for each tab?
export const PageTool = component$(()=>{
    const state = useSignal(0)

    const activate = $(()=>{
        y.value = window.innerHeight / 2
        console.log("y", y.value)
    })

    // when this runs on the server, the entire layout is undefined.
    // it doesn't run again on the client, so we get nothing.
    // useVisibleTask runs after mounting, so that's too late
    const showSearch = useSignal(false)
    const showTools = useSignal(false)
    const showBottom = useSignal(false)
    const desktop = useSignal(false)
    const y = useSignal(0)
    const width = useSignal(0)
    const w = useSignal(1)    // one column wide
    const app = useStore<AppStore>({
        showSearch: showSearch,
        showTools: showTools,
        showBottom,
        desktop,
        y
            //layout: make_struct(ld)
    })

    // if the width drops low enough we need to revert to mobile. 
    const listenWidth = $(()=>{
        if (width.value==0) {
            window.addEventListener('resize', ()=> {
                width.value = window.innerWidth
                w.value = Math.floor(width.value / 400)
            })
        }
    })
    const toggleTools = $(()=>{
        app.showTools.value = !app.showTools.value; 
        y.value = Math.max(y.value, 400)
    })
    const toggleSearch = $(()=>{
        app.showSearch.value = !app.showSearch.value; 
        y.value = Math.max(y.value, 400)
    })
    useContextProvider(AppContext, app);
    return <>
     <div class='flex h-screen w-screen fixed overflow-hidden'> 
        <Search/>
        <Slot name='main'/> 
        <Tools/>               
        </div>  
        <div 
        class='w-full absolute bg-neutral-900  rounded-t-lg bottom-0' 
        style={{
            "z-index": 10000,
            height: (64+y.value) + "px",
            bottom: 0
        }}

        onMouseDown$={(e)=>{
            const start = e.clientY - y.value
            const move = (e: MouseEvent) => {
              y.value = Math.max(0,(start -e.clientY))  // X if 
            }
            const up = (e: MouseEvent) => {
              window.removeEventListener("mousemove", move)
              window.removeEventListener("mouseup", up)
            }
            window.addEventListener("mousemove", move)
            window.addEventListener("mouseup", up)
            }
        }>
        <div class='h-4 flex justify-center'>
            <button class='bg-neutral-800 rounded-full w-16 h-2 my-1'/></div>            
    </div>
    <div class='text-md  w-full items-center flex px-1' >
    <Icon svg={bars_3} onClick$={()=>{toggleSearch} } /><div class='flex-1 text-md ml-2 '>

    
    { state.value== 0 && <button class='w-full' onClick$={toggleSearch }><input disabled class='bg-neutral-800 rounded-lg px-2 w-full' placeholder='Search'/></button> } 
    
    { state.value== 1 && <Search/>}
    
    </div> 
    <Icon svg={menuv} onClick$={toggleTools} />
    </div>

    </>
    
})

export const Tools = component$(()=>{
    return <div>Tools</div>
})

export const EditorTool = component$(()=>{
    const app = useApp()
    const state = useSignal(0)

    return <PageTool>
        <Editor q:slot='main'/>
        </PageTool>
})

// when do we show bottom? what do we show in bottom?
const EditorBottom = component$<{y: Signal<number>}>((props)=>{
    return <div>Editor tools</div>
})
const EditorTools = component$<{y: Signal<number>}>((props)=>{
    return <div>Editor tools</div>
})

// the bottom state must allow that the search and 

// the bottom tools can change depending on the page type. based on the tool.
// the tool is static, so we can still pre-render.

// the modal is going to be a bit different on desktop. 
const RightTools = component$(() => {
    return <div class='bg-red-200 h-96'>
        Right tools
    </div>
})
// query tools are generally split top and bottom, a different top/bottom split is useful for chat tools
// we need some template for this, and a mobile strategy.

// export const VerticalSplitTool = component$(()=>{
//     return <PageTool>

//         </PageTool>
// })

// export const ChatTool = component$(()=>{
//     return <PageTool>

//         </PageTool>
// })

// there might be special kind of tool for things like map that are open 2d scrollable?
    // we might only need this on desktop. but how do we tell if its desktop?
    // we can run the server as if it was mobile, but then use an async useTask to change it?
    // useTask$(()=>{
        
    //     window.addEventListener("resize", ()=>{
    //         l.width.value = window.innerWidth
    //         l.height.value = window.innerHeight
    //     })
    //     console.log("layout", l)
    // })