/* eslint-disable @typescript-eslint/no-unused-vars */
import { component$, createContextId, useContext, useContextProvider, useSignal, useStore, $, QwikMouseEvent, useComputed$, Signal, useTask$ } from "@builder.io/qwik";
import { Icon } from "../headless";
import { bars_3, bubble, cart, folder, search, tablet } from "./icon";
import { Search } from "./search";
import { $localize, xCircle } from "../i18n";
import { Cart } from "./cart";
import { Share } from "./share";
import { useLocation } from "../provider";
import { renderJson } from "./render";
import { TocTabbed } from "../toc";
import example from "../toc/test.en"
import { FileBrowser } from "../filebrowser";
import { Propose } from "../propose";
import { Account } from "../account";
import { proposeIcon } from "../theme";
const startApp = 'menu'
export interface AppStore {
    tab: Signal<string>
    y: Signal<number>
    user: Signal<string>
    branch: Signal<string>
}

const AppContext = createContextId<AppStore>("LAYOUT");
export function useApp() { return useContext<AppStore>(AppContext); }

// used to create the dialog



const toolData = [
    // the menu is sync'd to the current page.
    { name: "menu", desc: $localize`Browse`, svg: bars_3 },
    { name: "search", desc: $localize`Search`, svg: search },
    { name: "share", desc: $localize`Share`, svg: bubble },
    { name: "cart", desc: $localize`Cart`, svg: cart },
    { name: "propose", desc: $localize`Propose`, svg: proposeIcon },
    // { name: "account", desc: $localize`Account`, svg: personIcon },
    // behind "more" on mobile. we could also hide and require them to be in the menu

    //{ name: "data", desc: $localize`Data`, svg: circleStack },
]
const proposeData = [
    // the menu is sync'd to the current page.
    { name: "menu", desc: $localize`Browse`, svg: bars_3 },
    { name: "search", desc: $localize`Search`, svg: search },
    { name: "share", desc: $localize`Share`, svg: bubble },

    // behind "more" on mobile. we could also hide and require them to be in the menu
    { name: "edit", desc: $localize`Edit`, svg: tablet },
    { name: "files", desc: $localize`Files`, svg: folder },
    // how do I lock the main branch?
    // vote for adoption, publish
    // { name: "propose", desc: $localize`Propose`, svg: proposeIcon },
    // { name: "review", desc: $localize`Review`, svg: reviewIcon },
    //{ name: "account", desc: $localize`Account`, svg: personIcon },
    //{ name: "data", desc: $localize`Data`, svg: circleStack },
]

// creates the view of a particular tool
// maybe put in toolData, but then it has to be noserialize?




export const Review = component$(() => {
    return <div>Review</div>
})
export const Edit = component$(() => {
    return <div>Edit</div>
})


type TabKey = "menu" | "search" | "cart" | "share" | "edit" | "files" | "proposals" | "review" | "account"

const ToolDialog = component$(() => {
    const app = useApp()
    switch (app.tab.value) {
        case "menu": return <TocTabbed toc={example} />
        case "search": return <Search />
        case "share": return <Share />
        case "cart": return <Cart />
        case "edit": return <Edit/>
        case "files": return <FileBrowser />
        case "propose": return <Propose/>
        case "review": return <Review/>
        case "account": return <Account/>
    }
    return <div />
})


const Render = component$(() => {
    const content = useSignal("")
    // track the location? when the location changes we need to reload the content.
    // the server won't get the new request.
    const loc = useLocation()
    useTask$(async ({ track }) => {
        track(() => loc.url)
        content.value = await renderJson({})

    })
    return <div dangerouslySetInnerHTML={content.value} />
})



// custom tools = javascript or cache personal html



// we should be able to use media query to layout the buttons initially and only use javascript if a button is clicked.s
// when loading statically we can assume 1 wide. We don't need to decide 1-2-3 wide until a menu is requested.
// splitters should not download on mobile, only lazy load on desktop
// we need to store locally for each tab?
export const PageTool = component$(() => {
    const isListen = useSignal(false)
    const x = useSignal(280) // width of left column
    const y = useSignal(64)
    const width = useSignal(0)
    const height = useSignal(0)
    const user = useSignal("anonymous")
    const branch = useSignal("First draft")

    // should this be part of the url?
    const tab = useSignal(startApp)
    const app = useStore<AppStore>({
        user: user,
        tab,
        y: y,
        branch: branch
    })
    useContextProvider(AppContext, app);
    const Debug = component$(() => {
        const debug = useComputed$(() => {
            return JSON.stringify({
                x: x.value,
                y: y.value,
                tab: tab.value,
                width: width.value
            })
        })
        return <div>{debug.value}</div>
    })


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

    const toggle = $((x: string) => {
        console.log("toggle", x, tab.value)
        if (x == tab.value)
            tab.value = ""
        else {
            tab.value = x
            y.value = Math.max(y.value, 400)
        }
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

    const Desktop = component$(() => {
        const VRail = component$(() => {
            const VRailIcon = (props: { selected: boolean, svg: string, onClick$: () => void }) => {
                return <div onClick$={props.onClick$} class={`my-2 mb-4 w-full hover:text-white  flex border-l-2 ${props.selected ? "border-white text-white" : "text-neutral-500 border-neutral-900"}`}
                    >
                    <Icon svg={props.svg} class='w-8 h-8  flex-1' /></div>
            }
            return <div class=' w-12 flex flex-col items-center h-full  '>
                {toolData.map((x, i) => <VRailIcon key={x.name} selected={app.tab.value == x.name} svg={x.svg} onClick$={() => toggle(x.name)} />)}
            </div>
        })

        return <div class='w-screen h-screen hidden sm:flex bg-neutral-900'>
            <VRail/>
            {tab.value!="" &&<><div style={{
                width: x.value+"px"
            }}><ToolDialog/></div><div
                    onMouseDown$={leftSplit}
                    class='h-full   cursor-ew-resize flex flex-col justify-center bg-neutral-900' >
                    <button class='bg-neutral-800 cursor-ew-resize rounded-full h-16 w-2 mr-1' />
                </div></>}
            <div class='flex-1 bg-black px-2'>
                
            <Render />
            </div>
        </div>
    })

    const Mobile = component$(() => {
        const HRail = component$(() => {
            return <div>
                <div class='w-full flex items-center'>
                    {toolData.map((x, i) =>
                        <div key={x.name} class='flex flex-1 flex-col text-neutral-500 hover:text-blue-700 items-center ' style={{
                            "color": app.tab.value == x.name ? "white" : undefined
                        }}
                            onClick$={() => toggle(x.name)}
                        >
                            <Icon svg={x.svg} class='w-6 h-6  flex-1 block' />
                            <div key={x.name} class='flex-1 text-center text-xs'>{x.desc}</div>
                        </div>)}
                </div></div>
        })
        return <div class='flex-1 h-screen'>
            <div class='flex flex-col h-screen'>
                <div class='flex-1'><Render /></div>
                <div class='sm:hidden w-full  bg-neutral-900  rounded-t-lg bottom-0' onMouseDown$={bottomSplit}
                    style={{
                        height: (y.value) + "px",
                    }}>
                    <div class='h-4 flex justify-center'>
                        <button class='bg-neutral-800 rounded-full w-16 h-2 my-1' /></div>
                    {tab.value == "" && <HRail />}
                    <ToolDialog />
                </div>
            </div>
        </div>
    })

    return <div class='h-screen w-screen fixed overflow-hidden'>
        <Desktop />
        <Mobile />
    </div>
})



const MessageEditor = component$(() => {
    return <div class='w-full'>
        <Icon svg={bars_3} class='w-6 h-6 block' />
        <div contentEditable="true" class='flex-1 rounded-lg border-1 border-blue-700' />
    </div>
})

function close(app: AppStore) {
    app.tab.value = ""
    app.y.value = 64
}

export const Close = component$(() => {
    const app = useApp()

    return <Icon svg={xCircle} class='h-8 w-8 text-blue-500 hover:text-blue-700' onClick$={() => close(app)} />
})