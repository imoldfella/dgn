import { component$ } from "@builder.io/qwik"
import { SimplePage } from "../login"
import { Ab } from "../theme"
//const PaperClipIcon = (props: {class:string})=><Icon class={props.class} path={paperClip}/>
export const Onboard = component$(() => {
    return <SimplePage>
            <div q:slot="top-left"><Ab href='/signin'>{$localize`Sign in`}</Ab></div>
            <h1 class='w-full text-center mt-16 mb-8'>Datagrove</h1>
            <form action="#" class="relative">
                <div class="overflow-hidden rounded-lg border border-gray-300 shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
                    <label for="title" class="sr-only">
                        Title
                    </label>
                    <input
                        autoFocus
                        type="text"
                        name="title"
                        id="title"
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
                        value={''}
                    />


                    <div class="flex items-center bg-white dark:bg-black justify-between space-x-3 border-t border-gray-200 px-2 py-2 sm:px-3">
                        <div class="flex">
                            <button
                                type="button"
                                class="group -my-2 -ml-2 inline-flex items-center rounded-full px-3 py-2 text-left text-gray-400"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                                    <path fillRule="evenodd" d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.94 10.94a3.75 3.75 0 105.304 5.303l7.693-7.693a.75.75 0 011.06 1.06l-7.693 7.693a5.25 5.25 0 11-7.424-7.424l10.939-10.94a3.75 3.75 0 115.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 015.91 15.66l7.81-7.81a.75.75 0 011.061 1.06l-7.81 7.81a.75.75 0 001.054 1.068L18.97 6.84a2.25 2.25 0 000-3.182z" clipRule="evenodd" />
                                </svg>
                                <span class="text-sm italic text-gray-500 group-hover:text-gray-600">Add files (optional)</span>
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