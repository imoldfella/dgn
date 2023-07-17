import {  component$, noSerialize, useSignal, useStore, useVisibleTask$ } from "@builder.io/qwik"

import {createEditor} from 'lexical';

const config = {
  namespace: 'MyEditor',
  theme: {
  },
  onError: console.error
};


export const Editor = component$(() => {
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