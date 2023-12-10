import { component$ } from "@builder.io/qwik";
import { useLocation } from "./location";

export const Debug = component$(() => {
    const loc = useLocation()

    return <div class='fixed bottom-0 right-0 bg-gray-200 text-gray-800 p-2'>
        Debug
        <div>loc: {loc.url.pathname}</div>

    </div>
})