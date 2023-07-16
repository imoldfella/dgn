

import {  Signal, Slot, component$, createContextId, useContext, useContextProvider,useSignal,useStore } from "@builder.io/qwik";
import { Icon } from "../headless";
import { Cellify } from "./cell";

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
export const Sitemap = component$(()=>{
    return <div>Sitemap</div>
})

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
    return <div class='bg-black text-md absolute w-full items-center flex px-1' style={{
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
export const MobileTool = component$(() => {
    const app = useApp()

    return <><div class='flex h-screen w-screen fixed overflow-hidden bg-slate-800'>  
            <TopTools />     
            <div class='bg-slate-200 hidden'>
                <div class='min-h-96'>
                    <Slot name='main' />
                </div>
                <SiteFooter />
            </div>    
        {app.showLeft.value && <div class='bg-green-200 h-96'>
            <Sitemap />
        </div>}
        {app.showRight.value  && <RightTools /> }
    
        {app.showBottom.value && <div class='bg-blue-200 h-96'>
            <Slot name='bottom-drawer' /> </div>}
    </div>
    </>
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