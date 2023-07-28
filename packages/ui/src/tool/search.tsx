import { component$ } from "@builder.io/qwik"
import { Icon } from "../headless"
import { Close } from "./layout"
import { search } from "../theme"

// search background is a filterable/user-unique page. Generally this should have a sticky link to the drive root.
// it may have other sticky links as well

// generating user-unique pages can be done with a service, or managed by the client service worker in a batch job.


// we might want some kind of @ processing here, like gmail
const SearchBox = component$(() => {
    return <div class='flex-1 m-2 flex items-center shadow  bg-neutral-800  rounded-lg px-1'
                > <Icon svg={search} class='dark:text-white h-6 w-6' />
                    <input autoFocus
                        class=" flex-1 border-0 focus:ring-0 focus:outline-none bg-transparent dark:text-white"
                        placeholder={"Search"} type="search" /></div>
 
  
})
// search is a full screen dialog 
export const Search = component$(() => {

    // start with half height with search in page
    // segment control to switch page/site/all/world


    return <><div class='flex items-center mr-1'>
        <SearchBox />
        <Close/>
    </div>
    </>
})

export interface FilterSet {
    name: string   // translate
    type: "radio" | "check"
    values: string[]
}



// return a function that can continually resolve searches close to a previous search.


// a search might start with a view name and a prefix, and then return the facets that are available.

export interface FacetSelect {
    prefix: string
    offset?: number
    limit?: number
    facets?:  { [key: string]: boolean }
}

export interface SearchableView<T> {
    search: (x: FacetSelect) => Promise<T[]>
    facets: FilterSet[]
}
export interface SearchProps<T> extends FacetSelect {
    view: SearchableView<T>
    label: string // 
}
export type Searcher<T> = () => Promise<T[]>
// selection lists will often have chip lists.
// export  function SelectionList<T>(props: SearchProps<T>) {
//     const prefix = useSignal(props.prefix)
//     // resource, need to mutate whenever prefix changes.
//     const [res] = createResource(prefix, async (s: string) => props.view.search({...props, prefix: s}))
//     return <>
//         <div class='w-full h-full flex flex-col'>
//         <div><SearchBox /></div>
//         <div class='flex-grow overflow-auto'>
//         <For each={res() }>{ (e,i) => {
//             return props.children(e)
//         }}</For></div>
//         </div>
//     </>
// }

export const Edit = component$(() => {
    return <div>Message</div>
})