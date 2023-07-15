import { component$ } from "@builder.io/qwik"
import { PageTool } from "../tool"

export const Lexical = component$(() => {
    return <PageTool>
        <div q:slot='right-drawer'>
            <div>Right Drawer</div>
            </div>
        <div q:slot='main'>
            <div>Lexical</div>
        </div>
        </PageTool>
})