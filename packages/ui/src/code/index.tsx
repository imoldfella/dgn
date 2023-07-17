
import { PageTool } from "../tool"
import {
    component$,
    useStore,
    useSignal,
    noSerialize,
    useVisibleTask$,
    type NoSerialize,
  } from '@builder.io/qwik';
  import type Monaco from './monaco';
  import { monacoEditor } from './monaco';
   
  export default component$(() => {
    const editorRef = useSignal<HTMLElement>();
    const store = useStore<{ monacoInstance: NoSerialize<Monaco> }>({
      monacoInstance: undefined,
    });
   
    useVisibleTask$(() => {
      const editor = monacoEditor.create(editorRef.value!, {
        value: 'Hello, world!',
      });
      // Monaco is not serializable, so we can't serialize it as part of SSR
      // We can however instantiate it on the client after the component is visible
      store.monacoInstance = noSerialize(editor);
    });
    return <div ref={editorRef}>loading...</div>;
  });
const config = {
  namespace: 'MyEditor',
  theme: {
  },
  onError: console.error
};

const editor = createEditor(config);

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