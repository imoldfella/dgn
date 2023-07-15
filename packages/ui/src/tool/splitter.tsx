/* eslint-disable @typescript-eslint/no-unused-vars */
import { Signal, $ } from "@builder.io/qwik"

export interface VSplitterProps {
    y: Signal<number>
  }

export const VSplitterButton = (props: VSplitterProps) => {

    return <div 
        class='w-full h-1.5 absolute hover:bg-blue-500 hover:opacity-100 bg-blue-700 opacity-0 cursor-ns-resize' 
        style={{
            "z-index": 10000,
            top: props.y.value + "px"
        }}
        preventdefault:mousedown
        onMouseDown$={(e)=>{
            const start = e.clientY - props.y.value
            const move = (e: MouseEvent) => {
              props.y.value = (e.clientY - start)  // X if 
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
    x: Signal<number>
    right?: boolean
  }

  export const HSplitterButton = (props: HSplitterProps) => {
    return <div 
        class={`h-full w-1.5 absolute hover:bg-blue-500 hover:opacity-100 bg-blue-700 opacity-0 cursor-ns-resize `}
        style={{
            "z-index": 10000,
            left: props.right? undefined: props.x.value + "px",
            right: props.right ? props.x.value+"px": undefined
        }}
      
        onMouseDown$={(e)=>{
            const start = e.clientX - props.x.value
            const move = (e: MouseEvent) => {
                if (props.right) {
                    props.x.value = (start - e.clientX)  // X if 
                } else {
                     props.x.value = (e.clientX - start) 
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