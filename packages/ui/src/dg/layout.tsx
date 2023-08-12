/* eslint-disable @typescript-eslint/no-unused-vars */
import { component$, createContextId, useContext, useContextProvider, useSignal, useStore, $, QwikMouseEvent, Signal, useTask$, Slot, useVisibleTask$ } from "@builder.io/qwik";
import { Icon } from "../headless";
import { DarkButton, bars_3, xCircle } from "../theme";
import { LanguageSelect, useLocale } from "../i18n";
import { useLocation, useNavigate } from "../provider";
import { renderJson } from "./render";
import { Signin } from "../login";

const startApp = ''


export const AppContext = createContextId<AppStore>("LAYOUT");
export function useApp() { return useContext<AppStore>(AppContext); }


export interface Tool {
    name: string
    desc: string
    svg: string
    href?: string
}
export interface AppStore {
    me: Signal<Signin|null>
    tab: string
    y: number
    branch: string
    tool: Tool[]
    mobile: boolean
}


// creates the view of a particular tool
// maybe put in toolData, but then it has to be noserialize?
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

// const Debug = component$(() => {
//     const debug = useComputed$(() => {
//         return JSON.stringify({
//             x: x.value,
//             y: y.value,
//             tab: tab.value,
//             width: width.value
//         })
//     })
//     return <div>{debug.value}</div>
// })

// we should be able to use media query to layout the buttons initially and only use javascript if a button is clicked.s
// when loading statically we can assume 1 wide. We don't need to decide 1-2-3 wide until a menu is requested.
// splitters should not download on mobile, only lazy load on desktop
// we need to store locally for each tab?
export const PageTool = component$<{}>((props) => {
    const width = useSignal(0)
    const height = useSignal(0)
    const desktop = useSignal(true)



    useVisibleTask$(() => {
        const update = () => {
            width.value = window.innerWidth
            height.value = window.innerHeight
            desktop.value = width.value > 640
            console.log("update", width.value, height.value, desktop.value)
        }
        //if (width.value > 680) desktop.value = true
        window.addEventListener('resize', update)
        update()
        return () => {
            window.removeEventListener('resize', update)
        }
    })

    return <div class='h-screen w-screen fixed overflow-hidden'>
        {desktop.value && <Desktop >
            <Slot />
            <div q:slot='tools'><Slot name='tools' /></div>
            </Desktop>}
        {!desktop.value && <Mobile >
            <Slot />
            <div q:slot='tools'><Slot name='tools' /></div>
        </Mobile>}
    </div>
})

const Desktop = component$(() => {
    const app = useApp()
    const x = useSignal(280) // width of left column
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

    const toggle = $((x: string) => {
        console.log("toggle", x, app.tab)
        if (x == app.tab)
            app.tab = ""
        else {
            app.tab = x
        }
    })
    const VRailText = component$(() => {
        return <div />
    })
    const VRail = component$(() => {
        const VRailIcon = (props: { selected: boolean, svg: string, onClick$: () => void }) => {
            return <div onClick$={props.onClick$} class={`my-2 mb-4 w-full hover:text-white  flex border-l-2 ${props.selected ? "border-white text-white" : "text-neutral-500 border-neutral-900"}`}
            >
                <Icon svg={props.svg} class='w-8 h-8  flex-1' /></div>
        }
        return <div class=' w-12 flex flex-col items-center h-full   bg-neutral-900'>
            {app.tool.map((x, i) => <VRailIcon key={x.name} selected={app.tab == x.name} svg={x.svg} onClick$={() => toggle(x.name)} />)}
        </div>
    })

    return <div class='w-screen h-screen flex '>
        <VRail />

        {app.tab != "" && <>
            <div class='bg-neutral-900 border-l-[1px] border-neutral-800' style={{
                width: x.value + "px"
            }}><Slot name='tools' /></div><div
                onMouseDown$={leftSplit}
                class='h-full   cursor-ew-resize flex flex-col justify-center bg-neutral-900' >
                <button class='bg-neutral-800 cursor-ew-resize rounded-full h-16 w-2 mr-1' />
            </div></>}
        <div class='flex-1 overflow-auto'>
            <Slot />
        </div>
    </div>
})

const Mobile = component$(() => {
    const app = useApp()
    const nav = useNavigate()
    const toggle = $((x: string) => {
        console.log("toggle", x, app.tab)
        if (x == app.tab)
            app.tab = ""
        else {
            app.tab = x
            app.y = Math.max(app.y, 400)
        }
    })

    const bottomSplit = $((e: QwikMouseEvent<HTMLDivElement, MouseEvent>) => {
        const start = e.clientY
        const starty = app.y
        const move = (e: MouseEvent) => {
            //y.value = Math.max(0,(e.clientY-start))  // X if 
            app.y = Math.max(64, starty + (start - e.clientY))
        }
        const up = (e: MouseEvent) => {
            window.removeEventListener("mousemove", move)
            window.removeEventListener("mouseup", up)
        }
        window.addEventListener("mousemove", move)
        window.addEventListener("mouseup", up)
    })

    const HRail = component$(() => {
        return <div>
            <div class='w-full flex items-center py-1'>
                {app.tool.map((x, i) =>
                    <div key={x.name} class='flex flex-1 flex-col text-neutral-500 hover:text-blue-700 items-center ' style={{
                        "color": app.tab == x.name ? "white" : undefined
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
                    height: (app.y) + "px",
                }}>
                <div class='hidden h-4  justify-center'>
                    <button class='bg-neutral-800 rounded-full w-16 h-2 my-1' />
                </div>
                {app.tab == "" && <HRail />}
                {app.tab != "" && <Slot name='tools' /> }
            </div>
        </div>
    </div>
})






const MessageEditor = component$(() => {
    return <div class='w-full'>
        <Icon svg={bars_3} class='w-6 h-6 block' />
        <div contentEditable="true" class='flex-1 rounded-lg border-1 border-blue-700' />
    </div>
})

function close(app: AppStore) {
    app.tab = ""
    app.y = 46
}

export const Close = component$(({float}:{float?:boolean}) => {
    const app = useApp()

    return <>{app.mobile && <Icon svg={xCircle} class={`${float?'absolute top-2 right-2':''} h-8 w-8 text-blue-500 hover:text-blue-700`} onClick$={() => close(app)} />}</>
})


export const languageBar = component$(() => {
    const ln = useLocale()
    return <div dir={ln.dir} class='px-2 space-x-1 my-2  w-full flex flex-row items-center'>
    <div><Slot name='top-left' /></div>
    <div class='flex-1 ' />
    <div class='w-48 '><LanguageSelect /></div>
    <DarkButton />
</div>
})

export const SimpleDialog = component$(() => {
    return <>
        <div class="relative flex items-center justify-center w-full h-full p-2">
            <div class='w-96'>
                <Slot />
            </div>
        </div>
    </>
})
