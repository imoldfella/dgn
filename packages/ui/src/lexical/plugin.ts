import { COMMAND_PRIORITY_LOW, EditorState, LexicalCommand, LexicalEditor, createCommand } from "lexical";
import { createEffect } from "../dg/cell";
import {
    HistoryState,
    createEmptyHistoryState,
    registerHistory,
  } from "@lexical/history";
  import {isMimeType, mediaFileReader} from '@lexical/utils';
  import {DRAG_DROP_PASTE} from '@lexical/rich-text';

export function onChange(editor: LexicalEditor, onChange: (    editorState: EditorState,
    tags: Set<string>,
    editor: LexicalEditor) => void, props?: {
    ignoreSelectionChange?: boolean;
    ignoreHistoryMergeTagChange?: boolean;
}) {
    const x = props || {};
    return editor.registerUpdateListener(
        ({
            editorState,
            dirtyElements,
            dirtyLeaves,
            prevEditorState,
            tags,
        }) => {
            if (
                (x.ignoreSelectionChange &&
                    dirtyElements.size === 0 &&
                    dirtyLeaves.size === 0) ||
                (x.ignoreHistoryMergeTagChange &&
                    tags.has("history-merge")) ||
                prevEditorState.isEmpty()
            ) {
                return;
            }

            onChange(editorState, tags, editor);
        }
    )
}
export interface ImagePayload {
}
export type InsertImagePayload = Readonly<ImagePayload>;
const ACCEPTABLE_IMAGE_TYPES = [
    'image/',
    'image/heic',
    'image/heif',
    'image/gif',
    'image/webp',
  ];
export const INSERT_IMAGE_COMMAND: LexicalCommand<InsertImagePayload> =
  createCommand('INSERT_IMAGE_COMMAND');  
export function dragDropPaste(editor: LexicalEditor) {
    return editor.registerCommand(
        DRAG_DROP_PASTE,
        (files) => {
        (async () => {
            const filesResult = await mediaFileReader(
            files,
            [ACCEPTABLE_IMAGE_TYPES].flatMap((x) => x),
            );
            for (const {file, result} of filesResult) {
            if (isMimeType(file, ACCEPTABLE_IMAGE_TYPES)) {
                editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                altText: file.name,
                src: result,
                });
            }
            }
        })();
        return true;
        },
        COMMAND_PRIORITY_LOW,
        );
}