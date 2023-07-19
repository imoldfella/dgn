import {  component$, noSerialize, useSignal, useStore, useVisibleTask$ } from "@builder.io/qwik"

import {createEditor} from 'lexical';

const config = {
  namespace: 'Lexical',
  theme: {
  },
  onError: console.error
};


export const RichEditor = component$(() => {
    const editorRef = useSignal<HTMLElement>();
    const store = useStore<{ 
        doc: any
    }>({
        doc: undefined,
    });
 
    useVisibleTask$(() => {
        const editor = createEditor(config)
        store.doc = noSerialize(editor)

    })
    return <div 
    style={{
        outline: 'none'
    }}
    ref={editorRef} contentEditable='true' >
        Edit me 
        </div>
})

export const SiteMapEditor = component$(() => {

    return <div>
        
    </div>
})