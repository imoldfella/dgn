/* eslint-disable @typescript-eslint/no-unused-vars */
import { Slot, component$, useSignal, useVisibleTask$ } from "@builder.io/qwik"


// site map is a lexical editor where the priority is foldability and rearranging things.

// sitemap needs to run either in a modal or a drawer

// sitemap is tree structured.
// it can incorporate dynamic content from queries. this dynamic content can be expandable infinitely with "more".
// users can customize the sitemap with their own sticky links.
// ai can recommend links.
// alerts can run and make lists.
export const Sitemap = component$(()=>{
    return <div class='p-1'>Sitemap</div>
})
