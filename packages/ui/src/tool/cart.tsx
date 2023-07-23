import { component$, useSignal } from "@builder.io/qwik"
import { $localize } from "../i18n"
import { Segmented } from "../theme/segmented"


const Segments = [
    $localize`Cart`,
    $localize`Orders`,
    $localize`Account`,
]

export const Cart = component$(() => {
    const tab = useSignal(0)
    // switch pages
    return <>
    <Segmented values={Segments} signal={tab} class='mx-2 mt-2 text-sm'/>
    <div class='p-2'>
    { tab.value==0 && <div>Your Cart is empty</div> }
    { tab.value==1 && <div>Your Orders are empty</div> }
    { tab.value==2 && <div>Your Account is empty</div> }
    </div>
    </>
})
