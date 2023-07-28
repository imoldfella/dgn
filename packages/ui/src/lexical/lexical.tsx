import { NoSerialize, Signal, component$, createContextId, noSerialize, useContext, useContextProvider, useSignal, useStore, useVisibleTask$ } from "@builder.io/qwik"

import { $createParagraphNode, $createTextNode, $getRoot, $getSelection, $isRangeSelection, COMMAND_PRIORITY_EDITOR, EditorState, LexicalCommand, LexicalEditor, REDO_COMMAND, RangeSelection, UNDO_COMMAND, createCommand, createEditor } from 'lexical';
import { $localize } from "../i18n";
import { DivProps } from "../tool/modal";
import { Icon } from "../headless";
import { bars_3, mic, plus, redo, sparkles, undo } from "../theme";
import { onChange } from "./plugin";
import {
  HistoryState,
  createEmptyHistoryState,
  registerHistory,
} from "@lexical/history";

const config = {
  namespace: 'Lexical',
  theme: {
  },
  onError: console.error
};

const EditorContext = createContextId<Signal<NoSerialize<LexicalEditor>>>('lexical-editor');
const useEditor = () => useContext(EditorContext);

export const Menu = component$(() => {
  const speech = useSignal(false)
  const editor = useEditor()

  return <div class=' h-8 dark:bg-neutral-900 bg-neutral-100 border-b border-neutral-200 flex items-center '>
    <Icon class='mx-2 h-6 w-6' svg={bars_3} />
    <div class='flex-1 '></div>
    <div class='space-x-4 flex mr-2'>
      <Icon class='h-6 w-6' svg={undo} onClick$={() => {
        editor.value!.dispatchCommand(UNDO_COMMAND, null as any)
      }} />
      <Icon class='h-6 w-6' svg={redo} onClick$={() => {
        editor.value!.dispatchCommand(REDO_COMMAND, null as any)
      }} />
      <Icon class='h-6 w-6' svg={plus} />
      <Icon class='h-6 w-6' svg={sparkles} />
      <Icon 
        aria-label={$localize`Speech to text`}
        class='h-6 w-6' svg={mic} onClick$={()=>{
        speech.value = !speech.value
        editor.value!.dispatchCommand(SPEECH_TO_TEXT_COMMAND, speech.value)
      }} />
      {/* <button onClick$={editToggle}><Icon class='h-6 w-6' svg={menu} /></button></div> */}
    </div>
  </div>
})


// unclear if this even makes sense as a command? why not just insert normally?
export const SPEECH_TO_TEXT_COMMAND: LexicalCommand<boolean> = createCommand(
  'SPEECH_TO_TEXT_COMMAND',
);

const VOICE_COMMANDS: Readonly<
  Record<
    string,
    (arg0: { editor: LexicalEditor; selection: RangeSelection }) => void
  >
> = {
  '\n': ({ selection }) => {
    selection.insertParagraph();
  },
  redo: ({ editor }) => {
    editor.dispatchCommand(REDO_COMMAND, undefined);
  },
  undo: ({ editor }) => {
    editor.dispatchCommand(UNDO_COMMAND, undefined);
  },
};

export function speechUpdate(editor: LexicalEditor, transcript: string) {
  editor.update(() => {
    const selection = $getSelection();

    if ($isRangeSelection(selection)) {
      const command = VOICE_COMMANDS[transcript.toLowerCase().trim()];

      if (command) {
        command({
          editor,
          selection,
        });
      } else if (transcript.match(/\s*\n\s*/)) {
        selection.insertParagraph();
      } else {
        selection.insertText(transcript);
      }
    }
  });
}

// rather than use visible task, can we use a focus event? unclear which is better though esp if autofocus
export const RichEditor = component$(() => {
  const editorRef = useSignal<HTMLElement>();
  const store = useSignal<NoSerialize<LexicalEditor>>()
  const speech = useSignal(false)
  const SpeechRecognition = useSignal<any>()

  const startListen = () => {
    SpeechRecognition.value.start()
  }
  const stopListen = () => {
    SpeechRecognition.value.stop()
  }

  useContextProvider(EditorContext, store)

  useVisibleTask$(({ cleanup }) => {
    
    const editor = createEditor(config)
    editor.setRootElement(editorRef.value!)
    store.value = noSerialize(editor)

    const SpeechRecognition =
      // @ts-ignore
      window.SpeechRecognition || window.webkitSpeechRecognition;
     if (SpeechRecognition)
      editor.registerCommand(
        SPEECH_TO_TEXT_COMMAND,
        (_isEnabled: boolean) => {
          //setIsEnabled(_isEnabled);
          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      );

    onChange(editor, (editorState: EditorState,
      tags: Set<string>,
      editor: LexicalEditor) => {
      //console.log('change')
    })
    const hs = createEmptyHistoryState();


    const cleanupHistory = registerHistory(editor, hs, 1000)
    editor.update(() => {
      // Get the RootNode from the EditorState
      const root = $getRoot();

      // Get the selection from the EditorState
      const selection = $getSelection();

      // Create a new ParagraphNode
      const paragraphNode = $createParagraphNode();

      // Create a new TextNode
      const textNode = $createTextNode('Hello world');

      // Append the text node to the paragraph
      paragraphNode.append(textNode);

      // Finally, append the paragraph to the root
      root.append(paragraphNode);
    });
    cleanup(() => {
      cleanupHistory();
    })
  })
  return <div>
    <Menu />
    <div class='outline-none' ref={editorRef} contentEditable='true' />
  </div>
})

// this should be a lexical editor because it uses ordering; tables in general use sorting.
export const SiteMapEditor = component$(() => {

  return <div>

  </div>
})