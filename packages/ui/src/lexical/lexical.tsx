import {  component$, noSerialize, useSignal, useStore, useVisibleTask$ } from "@builder.io/qwik"

import {createEditor} from 'lexical';
import { $localize } from "../i18n";
import { DivProps } from "../tool/modal";

const config = {
  namespace: 'Lexical',
  theme: {
  },
  onError: console.error
};
// one line lexical editor with special syntax for contact links
export const InputLine = component$<DivProps>((props) => {
    const editorRef = useSignal<HTMLElement>();
    return <div {...props} ref={editorRef} contentEditable='true' />
})
export const InputTo = component$<{class?: string}>((props) => {
    const showMore = useSignal(false)
    return <>
     <div class='flex'><label for='to'>{ $localize`To` }</label><InputLine onFocus$={()=>{}} id='to' class={props.class} /></div>
    { showMore.value && <div>
        <div class='flex'><label for='cc'>{ $localize`Cc` }</label><InputLine class={props.class} /></div>
        </div>}
        </>
})


// rather than use visible task, can we use a focus event? unclear which is better though esp if autofocus
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

// this should be a lexical editor because it uses ordering; tables in general use sorting.
export const SiteMapEditor = component$(() => {

    return <div>
        
    </div>
})