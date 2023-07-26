import {  component$,$,  useSignal, useVisibleTask$ } from "@builder.io/qwik"
import { SimplePage } from "../login"
import { Ab } from "../theme"
import _ from "../i18n"


//const PaperClipIcon = (props: {class:string})=><Icon class={props.class} path={paperClip}/>


export const Onboard = component$(() => {
    const form = useSignal<HTMLElement>()
    const file = useSignal<HTMLInputElement>()
    const title = useSignal('')
    const description = useSignal('')
    // transform to create a store with all the localized strings.
    // make sure server doesn't await anything.
    // if we make this inline, then we force it to render at once.
    const create = $(async () => {
        // here we need to create a local database, and register with webrtc so we  can access it from other computers.
        // we can download an sqlite file, and run some macro expansion on it.
        // use opfs to write. alternately we can treat it as ssr, and expand as we read it? or we can do a combination of both as qwik does.
        const a= await fetch('/defaultdb.sqlite')

    })
    const upload = $(() => {
        file.value?.click()
    })
    const drop = $(() => {
    })

    useVisibleTask$(({ cleanup }) => {
        file.value?.addEventListener('change', () => {
            if (!file.value?.files) return
            const f : FileList = file.value.files;
            console.log(f)
        
          });
        cleanup(()=> {

        })
    })
    return <SimplePage >
            <div class='hidden'>
                <input ref={file} type="file" multiple id="file" class="hidden" />
            </div>
            <div  q:slot="top-left"><Ab href='/signin'>{_`Sign in`}</Ab></div>
            <h1 class='w-full text-center mt-16 mb-8'>Datagrove</h1>
            <form ref={form} action="#" preventdefault:submit  class="relative" onSubmit$={create} onDrop$={drop}>
                <div class="overflow-hidden rounded-lg border border-gray-300 shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
                    <label for="title" class="sr-only">
                        Title
                    </label>
                    <input
                        autoFocus
                        type="text"
                        name="title"
                        id="title"
                        bind:value={title}
                        class="block w-full border-0 pt-2.5 text-lg font-medium placeholder:text-gray-400 focus:ring-0 dark:bg-black"
                        placeholder="Name your website (optional)"
                    />
                    <label for="description" class="sr-only">
                        Description
                    </label>
                    <textarea
                        rows={2}
                        name="description"
                        id="description"
                        class="block w-full resize-none dark:text-white dark:bg-black border-0 py-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                        placeholder="Description (optional)"
                        bind:value={description}
                    />


                    <div class="flex items-center bg-white dark:bg-black justify-between space-x-3 border-t border-gray-200 px-2 py-2 sm:px-3">
                        <div class="flex" >
                            <button onClick$={upload}
                                type="button"
                                class="group -my-2 -ml-2 inline-flex items-center rounded-full px-3 py-2 text-left text-gray-400"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
</svg>
                             
                                <span class="text-sm italic text-gray-500 group-hover:text-gray-600"> Add files (optional)</span>
                            </button>
                        </div>
                        <div class="flex-shrink-0">
                            <button 
                                type="submit"
                                
                                class="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </SimplePage>
})
