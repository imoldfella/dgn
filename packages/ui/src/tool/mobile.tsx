/* eslint-disable @typescript-eslint/no-unused-vars */


import {  Signal, Slot, component$, createContextId, useContext, useContextProvider,useSignal,useStore, useVisibleTask$, $ } from "@builder.io/qwik";
import { Icon } from "../headless";
import { Cellify } from "./cell";
import { Editor } from "../lexical/lexical";
import { Sitemap } from "./sitemap";


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
    showLeft: Signal<boolean>,
    showRight: Signal<boolean>,
    showBottom: Signal<boolean>,
    desktop: Signal<boolean>,
}

const AppContext = createContextId<AppStore>("LAYOUT");
export function useApp() { return  useContext<AppStore>(AppContext); } 

export const SiteFooter = component$(()=>{
    return <div>SiteFooter</div>
})

// splitters should not download on mobile, only lazy load on desktop
export const PageTool = component$(()=>{
    // when this runs on the server, the entire layout is undefined.
    // it doesn't run again on the client, so we get nothing.
    // useVisibleTask runs after mounting, so that's too late
    const showLeft = useSignal(false)
    const showRight = useSignal(false)
    const showBottom = useSignal(false)
    const desktop = useSignal(false)
    const appStore = useStore<AppStore>({
        showLeft,
        showRight,
        showBottom,
        desktop
            //layout: make_struct(ld)
    })

    useContextProvider(AppContext, appStore);
    return <>
        <MobileTool/>
    </>
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
        <Icon svg={bars_3} onClick$={()=>{app.showLeft.value = !app.showLeft.value} } /><div class='flex-1 text-md ml-2 '>Title here</div>
        <Icon svg={menuv} onClick$={()=>{app.showRight.value = !app.showRight.value}} />
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
export const CommandEditor = component$(()=>{
    return <Editor/>
    
})

export const TextBlock = component$(()=>{
    return <div>TextBlock</div>
})

// the block list may not be fully editable; in a chat you can't always edit someone elses message. You might be able to if you are on the same team though or admin redacting something.
export const BlockList = component$(()=>{
    return <div>BlockList</div>
})

// bottom showing should be an overlap, both active.
// mobile overlay should be simple with server rendered code only.
export const MobileTool = component$(() => {
    const app = useApp()
    const y = useSignal(0)
    const state = useSignal(0)

    const activate = $(()=>{
        y.value = window.innerHeight / 2
        console.log("y", y.value)
    })

    return <div class='flex h-screen w-screen fixed overflow-hidden'>  
        <Editor/>                   
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
    <div class='text-md  w-full items-center flex px-1' >
        <Icon svg={bars_3} onClick$={()=>{app.showLeft.value = !app.showLeft.value} } /><div class='flex-1 text-md ml-2 '>

        { state.value== 0 && <button class='w-full' onClick$={()=>state.value=1 }><input disabled class='bg-neutral-800 rounded-lg px-2 w-full' placeholder='Search'/></button> } 
        
        { state.value== 1 && <CommandEditor/>}
        
        </div> 
        <Icon svg={menuv} onClick$={()=>{app.showRight.value = !app.showRight.value}} />
    </div></div>
    </div>
   
})

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