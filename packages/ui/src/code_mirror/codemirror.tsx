/* eslint-disable @typescript-eslint/no-unused-vars */
import { NoSerialize, component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";

import { EditorState } from "@codemirror/state"
import { EditorView, keymap } from "@codemirror/view"
import { defaultKeymap } from "@codemirror/commands"
import { json } from "@codemirror/lang-json"
import { sql } from "@codemirror/lang-sql"
import {
    highlightSpecialChars, drawSelection, highlightActiveLine, dropCursor,
    rectangularSelection, crosshairCursor,
    lineNumbers, highlightActiveLineGutter
} from "@codemirror/view"
import { Extension } from "@codemirror/state"
import {
    defaultHighlightStyle, syntaxHighlighting, indentOnInput, bracketMatching,
    foldGutter, foldKeymap
} from "@codemirror/language"
import { history, historyKeymap } from "@codemirror/commands"
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search"
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete"

import { lintKeymap } from "@codemirror/lint"
import './code.css'
import { noSerialize } from '@builder.io/qwik';


export const basicSetup: Extension = (() => [
    lineNumbers(),
    highlightActiveLineGutter(),
    highlightSpecialChars(),
    history(),
    foldGutter(),
    drawSelection(),
    dropCursor(),
    EditorState.allowMultipleSelections.of(true),
    indentOnInput(),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    bracketMatching(),
    closeBrackets(),
    autocompletion(),
    rectangularSelection(),
    crosshairCursor(),
    highlightActiveLine(),
    highlightSelectionMatches(),
    json(),
    sql(),
    keymap.of([
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...searchKeymap,
        ...historyKeymap,
        ...foldKeymap,
        ...completionKeymap,
        ...lintKeymap
    ])
])()

export const CodeEditor = component$<{ language: string }>((props) => {
    const el = useSignal<HTMLDivElement>()
    const cm = useSignal<NoSerialize<EditorView>>()

    useVisibleTask$(() => {
        const startState = EditorState.create({
            doc: "hello, world",
            extensions: [
                basicSetup,
            ]
        })
        cm.value = noSerialize(new EditorView({
            state: startState,
            parent: el.value
        }))
    })

    return <div ref={el} class="w-full h-full">
    </div>
})


