

import { Slot, component$, useSignal,$ } from "@builder.io/qwik";


// splitters should not download on mobile, only lazy load on desktop

const Sitemap = component$(()=>{
    return <div>Sitemap</div>
})
const TopTools = component$(()=>{
    return <div>TopTools</div>
})
const SiteFooter = component$(()=>{
    return <div>SiteFooter</div>
})
// we might have standard modal's in here
// we will only have either left or right open at a time
// if the screen is wide enough it will split, if not it will overlay

// the tool pane should have a an outer rail of tabs that can be configured. this might be optional for 

enum Screen {
    left,
    bottom, 
    right,
    none
}
export const MobileTool = component$(()=>{
        const screen = useSignal(Screen.none);
        // bottom has to be slide up modal here.

        return <div class='flex h-screen w-screen fixed overflow-hidden'>
                { screen.value === Screen.left && <div class='bg-green-200'>
                    <Sitemap/>
                </div>}
                <div>
                <div class='absolute' >
                    <TopTools/>
                    </div>
               <div class='bg-slate-200'>
                    <Slot name='main'/>
                    <SiteFooter/>
                </div>
                </div>
                { screen.value === Screen.right && <div class='bg-red-200'>
                    <Slot name='right-drawer'/>
                </div>}
                { screen.value === Screen.bottom && <div class='bg-blue-200'>
                    <Slot name='bottom-drawer'/> </div>}
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