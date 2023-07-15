import { Slot, component$, createContextId, useContext, useContextProvider, useSignal, useStore, useVisibleTask$ } from "@builder.io/qwik";
import { HSplitterButton, VSplitterButton } from "./splitter";
import { isServer } from "@builder.io/qwik/build";
import { MobileTool } from "./mobile";

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
interface Layout {
    width: number;
}
const LayoutContext = createContextId<Layout>("LAYOUT");


export const PageTool = component$(()=>{
    const layout = useStore<Layout>({
        width: 0
    });

    useContextProvider(LayoutContext, layout);
    useVisibleTask$(()=>{
        if (!window) return;
        window.addEventListener("resize", ()=>{
            layout.width = window.innerWidth;
        })
    })
    return <>
        { layout.width < 680 ? <DesktopTool/> : <MobileTool/>}
    </>
})
interface LocalData {
    leftSplitter: number;
    rightSplitter: number;
    middleSplitter: number;
}

// the tool pane should have a an outer rail of tabs that can be configured. this might be optional for 
export const DesktopTool = component$(()=>{
        const layout = useContext<Layout>(LayoutContext);
        const leftSplitter = useSignal(300);
        const rightSplitter = useSignal(600);
        const middleSplitter = useSignal(400);


        // when mounted, load the percentage split from local storage
        // 
        useVisibleTask$(({cleanup})=>{
            if (!window) return;
            let layout : LocalData = {
                leftSplitter: .33,
                rightSplitter: .66,
                middleSplitter: .5
            }
            const s = localStorage.getItem("layout")
            if (s) {
                layout = JSON.parse(s)
            }
            leftSplitter.value = layout.leftSplitter * window.innerWidth;
            rightSplitter.value = layout.rightSplitter * window.innerWidth;
            middleSplitter.value = layout.middleSplitter * window.innerHeight;
            cleanup(()=>{
                const r = {
                    leftSplitter: leftSplitter.value / window.innerWidth,
                    rightSplitter: rightSplitter.value / window.innerWidth,
                    middleSplitter: middleSplitter.value / window.innerHeight
                }
                localStorage.setItem("layout", JSON.stringify(r));
            })
        })



        return <div class='flex h-screen w-screen fixed overflow-hidden'>
                
            <div class='bg-green-200' style={{
                width: leftSplitter.value + "px"
            }}>
                <Sitemap/>
            </div>
            <HSplitterButton x={leftSplitter}/>
            <div class='absolute' style={{
                left: leftSplitter.value + "px",
                right: (layout.width - rightSplitter.value) + "px"
            }}>
                <div class='bg-slate-100 absolute w-full' style={{
                    top: "0px",
                    bottom: "48px",
                }}>
                <TopTools >
                    Title here
                </TopTools>
                </div>
                <div class='bg-slate-200 absolute w-full' style={{
                    top: "48px",
                    bottom: -middleSplitter.value + "px",
                }}>
                <Slot name='main'/>
                <SiteFooter/>
                </div>
                <div  class='bg-slate-400 absolute w-full' style={{
                    top: middleSplitter.value + "px",
                    bottom: "0px",

                }}>
                    bottom
                <Slot name='bottom'/>
                </div>
                <VSplitterButton y={middleSplitter}/>
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