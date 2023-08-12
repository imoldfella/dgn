import { HTMLAttributes, component$ } from "@builder.io/qwik"


// framer motion
export function AnimatePresence(props: { children: any }) {
    return <div>{props.children}</div>
  }
  export namespace motion {
    export interface MotionProps {
      initial: any
      animate: any
      exit: any
    }
    export const div = component$<HTMLAttributes<HTMLDivElement>&MotionProps>(() => {
      return <div></div>
    })
  }

  