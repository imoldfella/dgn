import { component$ } from "@builder.io/qwik"
import { CodeEditor } from "../code_mirror/codemirror"


export const Query = component$(() => {
    return <CodeEditor language="sql" />
})