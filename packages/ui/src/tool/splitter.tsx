/* eslint-disable @typescript-eslint/no-unused-vars */

import { Cell } from "./cell"


export interface VSplitterProps {
    y: Cell<number>
  }

export const VSplitterButton = (props: VSplitterProps) => {
    const y = props.y!
    return <div 
        class='w-full h-1.5 absolute hover:bg-blue-500 hover:opacity-100 bg-blue-700 opacity-0 cursor-ns-resize' 
        style={{
            "z-index": 10000,
            top: props.y?._value + "px"
        }}
        preventdefault:mousedown
        onMouseDown$={(e)=>{
            const start = e.clientY - y.value
            const move = (e: MouseEvent) => {
              y.value = (e.clientY - start)  // X if 
            }
            const up = (e: MouseEvent) => {
              window.removeEventListener("mousemove", move)
              window.removeEventListener("mouseup", up)
            }
            window.addEventListener("mousemove", move)
            window.addEventListener("mouseup", up)
            }
        }
        >
      </div>
  }

  export interface HSplitterProps {
    x: Cell<number>
    right?: boolean
  }

  export const HSplitterButton = (props: HSplitterProps) => {
    const x = props.x!
    return <div 
        class={`h-full w-1.5 absolute hover:bg-blue-500 hover:opacity-100 bg-blue-700 opacity-0 cursor-ns-resize `}
        style={{
            "z-index": 10000,
            left: props.right? undefined: x.value + "px",
            right: props.right ? x.value+"px": undefined
        }}
      
        onMouseDown$={(e)=>{
            const start = e.clientX - x.value
            const move = (e: MouseEvent) => {
                if (props.right) {
                    x.value = (start - e.clientX)  // X if 
                } else {
                     x.value = (e.clientX - start) 
                 } // X if 
            }
            const up = (e: MouseEvent) => {
                window.removeEventListener("mousemove", move)
                window.removeEventListener("mouseup", up)
            }
            window.addEventListener("mousemove", move)
            window.addEventListener("mouseup", up)            
        }}>
      </div>
  }