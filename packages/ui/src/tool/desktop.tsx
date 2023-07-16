import { Slot, component$, createContextId,  useContext } from "@builder.io/qwik";
import { HSplitterButton, VSplitterButton } from "./splitter";

import { Cellify, computed } from "./cell";
import { SiteFooter, Sitemap } from "./mobile";


 
      


// we might have standard modal's in here
// we will only have either left or right open at a time
// if the screen is wide enough it will split, if not it will overlay

// when the window is sized we recalculate all the panes based on percentage



    // const sz = useSignal({x:0,y:0})
    // const leftSplitter = useSignal(0)
    // const rightSplitter = useSignal(0)
    // const middleSplitter = useSignal(0)
    // const showLeft = useSignal(false)
    // const showRight = useSignal(false)
    // const showBottom = useSignal(false)

    // note that on the server this will be undefined, so by using ! we committing to validate that ourselves


// the tool pane should have a an outer rail of tabs that can be configured. this might be optional for 
export const DesktopTool = component$(()=>{
        const app = useApp()

        // computations run when any cell changes
        const computedLeft = computed(()=> { return layout.showLeft.value?layout.width.value*layout.leftSplitter.value: 0})
        const computedRight = computed(()=> { return layout.showRight.value?layout.width.value*layout.rightSplitter.value: layout.width.value})
        const computedMiddle = computed(()=> { return layout.showBottom.value?layout.height.value*layout.middleSplitter.value: 0})

        return <div class='flex h-screen w-screen fixed overflow-hidden'>
                
            <div class='bg-green-200' style={{
                width: computedLeft.value + "px"
            }}>
                <Sitemap/>
            </div>
            <HSplitterButton x={layout.leftSplitter} width={layout.width} />
            <div class='absolute' style={{
                left: computedLeft.value + "px",
                right: (layout.width.value - computedRight.value) + "px"
            }}>
   
                <div class='bg-slate-200 absolute w-full' style={{
                    top: "48px",
                    bottom: -layout.middleSplitter.value + "px",
                }}>
                <Slot name='main'/>
                <SiteFooter/>
                </div>
                <div  class='bg-slate-400 absolute w-full' style={{
                    top: layout.middleSplitter.value + "px",
                    bottom: "0px",

                }}>
                    bottom
                <Slot name='bottom'/>
                </div>
                <VSplitterButton y={computedMiddle}/>
                <Slot name='console'/>
                
            </div>

            <HSplitterButton x={layout.rightSplitter} width={layout.width}/>
            <div class="fixed bg-red-200" style={{
                top: "0px",
                bottom: "0px",
                left: layout.rightSplitter.value + "px",
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