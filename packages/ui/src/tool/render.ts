/* eslint-disable @typescript-eslint/no-unused-vars */

import { $generateHtmlFromNodes } from '@lexical/html'
import { createHeadlessEditor } from '@lexical/headless'
import { $createParagraphNode, $createTextNode, $getRoot, EditorState, SerializedEditorState } from 'lexical';
import { JSDOM } from 'jsdom'
import example from './example2.json'
// render some json to to html.

const dom = new JSDOM()
// @ts-ignore
global.window = dom.window
global.document = dom.window.document
global.DocumentFragment = dom.window.DocumentFragment

export async function renderJson(json: any): Promise<string> {
    const editor = createHeadlessEditor({
        nodes: [],
        editable: false,
        onError: () => { },
    });
    let s = "should be replaced"
    let value = `{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"hello lexical","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}`

    value = JSON.stringify(example)

    try {
        editor.setEditorState(editor.parseEditorState(value));
    } catch(e) {
        console.log("WTF", e);
        return "error"
    }
    editor.update(() => {
        // const value = `{"root":{"children":[{"children":[{
        //     "detail": 0,
        //     "format": 0,
        //     "mode": "normal",
        //     "style": "",
        //     "text": "In case you were wondering what the black box at the bottom is – it's the debug view, showing the current state of the editor. You can disable it by pressing on the settings control in the bottom-left of your screen and toggling the debug view setting.",
        //     "type": "text",
        //     "version": 1
        //   }],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}`
         s = $generateHtmlFromNodes(editor,null);
    })
    return s
}



