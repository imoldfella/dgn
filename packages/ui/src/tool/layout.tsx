/* eslint-disable @typescript-eslint/no-unused-vars */
import { component$, createContextId, useContext, useContextProvider, useSignal, useStore, $, QwikMouseEvent, useComputed$, Signal, useTask$, Slot, useVisibleTask$ } from "@builder.io/qwik";
import { Icon } from "../headless";
import { DarkButton, bars_3, bubble, cart, elipsis, folder, search, tablet } from "../theme";
import { Search } from "../search/search";
import { $localize, LanguageSelect, xCircle } from "../i18n";
import { Cart } from "./cart";
import { Share } from "../share/share";
import { useLocation, useNavigate, useSignin } from "../provider";
import { renderJson } from "./render";
import { Dialog, TocTabbed } from "../toc";
import example from "../toc/test.en"
import { FileBrowser } from "../filebrowser";
import { Propose } from "../propose";
import { Account } from "../account";
import { personIcon, proposeIcon } from "../theme";
import { MessageStream, SearchBox } from "../message";
import { More } from "../more/more";
const startApp = ''
export interface AppStore {
    tab: Signal<string>
    y: Signal<number>
    branch: Signal<string>
}

const AppContext = createContextId<AppStore>("LAYOUT");
export function useApp() { return useContext<AppStore>(AppContext); }


interface Tool {
    name: string
    desc: string
    svg: string
    href?: string
}

const guestTool : Tool[] = [
    // the menu is sync'd to the current page.
    //{ name: "menu", desc: $localize`Browse`, svg: bars_3 },
    { name: "search", desc: $localize`Search`, svg: search },
    //{ name: "trending", desc: $localize`Trending`, svg: bubble },
    { name: "login", desc: $localize`Sign in`, svg: personIcon , href: "/signin"},
    // { name: "share", desc: $localize`Share`, svg: bubble },
    { name: "cart", desc: $localize`Cart`, svg: cart },
    //{ name: "propose", desc: $localize`Propose`, svg: proposeIcon },
    // { name: "account", desc: $localize`Account`, svg: personIcon },
    // behind "more" on mobile. we could also hide and require them to be in the menu

    //{ name: "data", desc: $localize`Data`, svg: circleStack },
]
const memberTool : Tool[] = [
    // the menu is sync'd to the current page.
    { name: "menu", desc: $localize`Browse`, svg: bars_3 },
    { name: "search", desc: $localize`Search`, svg: search },
    { name: "share", desc: $localize`Share`, svg: bubble },

    // behind "more" on mobile. we could also hide and require them to be in the menu
    // { name: "edit", desc: $localize`Edit`, svg: tablet },
    // { name: "files", desc: $localize`Files`, svg: folder },
    { name: "cart", desc: $localize`Cart`, svg: cart },
    { name: "more", desc: $localize`More`, svg: elipsis },

    //{ name: "account", desc: $localize`Account`, svg: personIcon },
    // how do I lock the main branch?
    // vote for adoption, publish
    // { name: "propose", desc: $localize`Propose`, svg: proposeIcon },
    // { name: "review", desc: $localize`Review`, svg: reviewIcon },

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


type TabKey = "menu" | "search" | "cart" | "share" | "edit" | "files" | "proposals" | "review" | "account" | "more"





// this is going to be a recent at top infinite scroll for 
// we should make this a slot for page tool
export const Render = component$(() => {
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



// we should be able to use media query to layout the buttons initially and only use javascript if a button is clicked.s
// when loading statically we can assume 1 wide. We don't need to decide 1-2-3 wide until a menu is requested.
// splitters should not download on mobile, only lazy load on desktop
// we need to store locally for each tab?
export const PageTool = component$<{tool?: string}>((props) => {   
    // maybe this should come as a signal?
    const tab = useSignal(props.tool??"")
    const y = useSignal(props.tool? 400 :46)
    const x = useSignal(280) // width of left column

    const user = useSignin()
    const nav = useNavigate()
    const isListen = useSignal(false)
    const width = useSignal(0)
    const height = useSignal(0)
    const branch = useSignal("First draft")
    const desktop = useSignal(true)
    // should this be part of the url?

    const app = useStore<AppStore>({
        tab,
        y: y,
        branch: branch
    })
    const tool = useComputed$(() => {
        if (user.value) return memberTool
        return memberTool
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

    useVisibleTask$(() => {
        if (isListen.value) return
        isListen.value = true
        const update = () => {
            width.value = window.innerWidth
            height.value = window.innerHeight
            desktop.value = width.value > 640
            console.log("update", width.value, height.value, desktop.value)
        }
        //if (width.value > 680) desktop.value = true
        window.addEventListener('resize', update)
        update()
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
        // break to allow side by side annotations.

        const VRailText = component$(() => {
            return <div/>
        })
        const VRail = component$(() => {
            const VRailIcon = (props: { selected: boolean, svg: string, onClick$: () => void }) => {
                return <div onClick$={props.onClick$} class={`my-2 mb-4 w-full hover:text-white  flex border-l-2 ${props.selected ? "border-white text-white" : "text-neutral-500 border-neutral-900"}`}
                >
                    <Icon svg={props.svg} class='w-8 h-8  flex-1' /></div>
            }
            return <div class=' w-12 flex flex-col items-center h-full   bg-neutral-900'>
                {tool.value.map((x, i) => <VRailIcon key={x.name} selected={app.tab.value == x.name} svg={x.svg} onClick$={() => toggle(x.name)} />)}
            </div>
        })

        return <div class='w-screen h-screen hidden sm:flex '>
            <VRail />
            {tab.value != "" && <>
                <div class='bg-neutral-900 border-l-[1px] border-neutral-800' style={{
                        width: x.value + "px"
                    }}><Slot name='tools' /></div><div
                onMouseDown$={leftSplit}
                class='h-full   cursor-ew-resize flex flex-col justify-center bg-neutral-900' >
                    <button class='bg-neutral-800 cursor-ew-resize rounded-full h-16 w-2 mr-1' />
                </div></>}
            <div class='flex-1 bg-black px-2 overflow-auto max-w-xl'>
                <Slot/>
            </div>
            {/* <div class='flex-1 bg-red-500'>
                bonus
                </div> */}
        </div>
    })

    const Mobile = component$(() => {
        const HRail = component$(() => {
            return <div>
                <div class='w-full flex items-center py-1'>
                    {tool.value.map((x, i) =>
                        <div key={x.name} class='flex flex-1 flex-col text-neutral-500 hover:text-blue-700 items-center ' style={{
                            "color": app.tab.value == x.name ? "white" : undefined
                        }}
                            onClick$={() => {
                                if (x.href) {
                                    nav(x.href)
                                } else {
                                 toggle(x.name)
                                }
                            }}
                        >
                            <Icon svg={x.svg} class='w-6 h-6  flex-1 block' />
                            <div key={x.name} class='flex-1 text-center text-xs'>{x.desc}</div>
                        </div>)}
                </div></div>
        })
        return <div class='flex-1 h-screen'>
            <div class='flex flex-col h-screen'>
                <div class='flex-1 overflow-auto'><Slot /></div>
                <div class='sm:hidden w-full  bg-neutral-900  rounded-t-lg bottom-0' onMouseDown$={bottomSplit}
                    style={{
                        height: (y.value) + "px",
                    }}>
                    <div class='hidden h-4  justify-center'>
                        <button class='bg-neutral-800 rounded-full w-16 h-2 my-1' />
                        </div>
                    {tab.value == "" && <HRail />}
                    <Slot name='tools' />
                </div>
            </div>
        </div>
    })

    return <div class='h-screen w-screen fixed overflow-hidden'>
        {desktop.value && <Desktop ><Slot /></Desktop>}
        {!desktop.value && <Mobile ><Slot /></Mobile>}
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
    app.y.value = 46
}

export const Close = component$(() => {
    const app = useApp()

    return <Icon svg={xCircle} class='h-8 w-8 text-blue-500 hover:text-blue-700' onClick$={() => close(app)} />
})