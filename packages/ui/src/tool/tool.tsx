import { Slot, component$, createContextId, useComputed$, useContext, useContextProvider, useVisibleTask$ } from "@builder.io/qwik";
import { HSplitterButton, VSplitterButton } from "./splitter";
import { MobileTool } from "./mobile";
import { Icon } from "../headless";

import { Cell, Cellify, computed, load_struct } from "./cell";


export type LayoutStruct = Cellify<{
        leftSplitter: number
        rightSplitter: number
        middleSplitter: number
        showLeft: boolean
        showRight: boolean
        showBottom: Boolean
        size: Point
    }>
  
      

// splitters should not download on mobile, only lazy load on desktop

const Sitemap = component$(()=>{
    return <div>Sitemap</div>
})

const SiteFooter = component$(()=>{
    return <div>SiteFooter</div>
})
// we might have standard modal's in here
// we will only have either left or right open at a time
// if the screen is wide enough it will split, if not it will overlay

interface StoredData {
    leftSplitter: number;
    rightSplitter: number;
    middleSplitter: number;
}
interface Point {
    x: number 
    y: number
}



const emptyStoredData : StoredData = {
    leftSplitter: .3,
    rightSplitter: .7,
    middleSplitter: .5
}
export function storedData() : StoredData {
    let l : StoredData = emptyStoredData
    const s = localStorage.getItem("layout")
    if (s) {
        l = JSON.parse(s)
    }
    return l
}

// when the window is sized we recalculate all the panes based on percentage

const LayoutContext = createContextId<LayoutStruct>("LAYOUT");

const bars_3 = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
</svg>`


export const PageTool = component$(()=>{
    // const sz = useSignal({x:0,y:0})
    // const leftSplitter = useSignal(0)
    // const rightSplitter = useSignal(0)
    // const middleSplitter = useSignal(0)
    // const showLeft = useSignal(false)
    // const showRight = useSignal(false)
    // const showBottom = useSignal(false)

    // note that on the server this will be undefined, so by using ! we committing to validate that ourselves
    const layout  = load_struct("layout", {
        leftSplitter: 0,
        rightSplitter: 0,
        middleSplitter: 0,
        showLeft: 0,
        showRight: 0,
        showBottom: 0,
        width: 0,
        height: 0,
    })!
    useContextProvider(LayoutContext, layout as object);

    useVisibleTask$(()=>{
        if (!window) return;
        window.addEventListener("resize", ()=>{
            layout.width.value = window.innerWidth
            layout.height.value = window.innerHeight
        })
    })
    return <>
        <div class='hidden absolute bg-red-800'  style={{
            "z-index": 10000,
        }}>
            {layout.width.value}
            </div>
        { layout.width.value > 680 ? <DesktopTool/> : <MobileTool/>}
    </>
})

// the tool pane should have a an outer rail of tabs that can be configured. this might be optional for 
export const DesktopTool = component$(()=>{
        const layout = useContext<LayoutStruct>(LayoutContext);

        // computations run when any cell changes
        const computedLeft = computed(()=> { return layout.showLeft.value?layout.size.value.x*layout.leftSplitter.value: 0})
        const computedRight = computed(()=> { return layout.showRight.value?layout.size.value.x*layout.rightSplitter.value: layout.size.value.x})
        const computedMiddle = computed(()=> { return layout.showBottom.value?layout.size.value.y*layout.middleSplitter.value: 0})

        return <div class='flex h-screen w-screen fixed overflow-hidden'>
                
            <div class='bg-green-200' style={{
                width: computedLeft.value + "px"
            }}>
                <Sitemap/>
            </div>
            <HSplitterButton x={layout.leftSplitter} width={layout.size} />
            <div class='absolute' style={{
                left: computedLeft.value + "px",
                right: (layout.width - computedRight.value) + "px"
            }}>
                <div class='bg-slate-100 absolute w-full' style={{
                    top: "0px",
                    bottom: "48px",
                }}>
                <div class='flex w-full' >
                    <Icon svg={bars_3} onClick$={()=>{layout.st.showLeft = !layout.st.showLeft} } /><div class='flex-1'>Title here</div>
                    <Icon svg={bars_3} onClick$={()=>{layout.st.showRight = !layout.st.showRight}} />
                </div>
                </div>
                <div class='bg-slate-200 absolute w-full' style={{
                    top: "48px",
                    bottom: -layomiddleSplitter + "px",
                }}>
                <Slot name='main'/>
                <SiteFooter/>
                </div>
                <div  class='bg-slate-400 absolute w-full' style={{
                    top: layout.st.middleSplitter + "px",
                    bottom: "0px",

                }}>
                    bottom
                <Slot name='bottom'/>
                </div>
                <VSplitterButton y={computedMiddle}/>
                <Slot name='console'/>
                
            </div>

            <HSplitterButton x={rightSplitter}/>
            <div class="fixed bg-red-200" style={{
                top: "0px",
                bottom: "0px",
                left: rightSplitter.value + "px",
                right: "0px"
            }}>
            <Slot name='right-drawer'/>
            </div>
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