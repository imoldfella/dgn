import { component$, $, useStore,  useVisibleTask$ } from "@builder.io/qwik";
import { useNavigate } from "../provider";
import { documentIcon, elipsis } from "../theme";
import { Icon } from "../headless";

// this is the part of store that we keep in localstorage

// 

const example : FileItem[] = [
    { 
        avatar: documentIcon, 
        class: "",
        path: "/index.html", 
        name: "index.html", 
        folder: false, 
        level: 0, 
        type: "html", 
        git: ""
    },

]

export interface FileItem {
    path: string
    name: string
    folder: boolean
    level: number
    type: string
    git: string

    avatar: string 
    class: string
}

export interface BrowserState {
    open: Record<string, boolean>
}
export interface FileStore {
    state: BrowserState
    list: FileItem[]
}

export const FileBrowser = component$(() => {
    const nav = useNavigate()
    const store = useStore<FileStore>({
        state: {
            open: {},
        },
        list: example,
    })

    // useVisibleTask$(({cleanup}) => {
    //     store.state = JSON.parse(localStorage.getItem("filebrowser")??'{open:{}}')
    //     cleanup(() => {
    //         localStorage.setItem("filebrowser", JSON.stringify(store.state))
    //     })
    // })

    const tapFile = $((e: FileItem) => {
        nav(e.path)
    })
    const tapMenu = $((e: FileItem) => {
        nav(e.path)
    })

    return <div>
        { store.list.map((e:FileItem,index: number) => {
            return <div class='flex' key={index}>
                <div onClick$={()=>tapFile(e)} class='flex-1'>{e.name}</div>
                <Icon svg={elipsis} onClick$={()=>tapMenu(e)}  />
                </div>
        })}</div>

    // return h('div', null, 'Hello World')
})