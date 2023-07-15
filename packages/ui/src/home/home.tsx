/* eslint-disable @typescript-eslint/no-unused-vars */
import { component$ } from "@builder.io/qwik";


// home is build around an editor stack, editors are configurable and lazy loaded. Editors should put their tools on the right, since the page they are editing is probably going to put its menu on the left

// editors also need to place the file management tool, so the user can navigate to other files.

// the url should pick the editor
// the domain will pick the org, site and slice
// then we have /{language}/tool/{path}

// there are tradeoffs with /tool/{path} vs {path}.tool
// have tool first makes onion routing a little more natural
// but it makes it harder to browse files since directories can merge multiple tools.
// onboard, signin, are just tools

export interface Editor {
    path: string;
    component: any;
}

export const home = component$(()=>{
     
    return <div>

        </div>
})