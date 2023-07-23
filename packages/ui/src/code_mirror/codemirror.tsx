import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik'
import { mountDgcm } from 'dgcm'

export const CodeEditor = component$<{ language: string }>(() => {
    const el = useSignal<HTMLElement>()
    useVisibleTask$(()=>{
        mountDgcm(el.value!)
    })
    return <div ref={el} />
})