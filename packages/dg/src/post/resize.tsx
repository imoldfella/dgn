import { Signal, QRL, useVisibleTask$ } from "@builder.io/qwik";


export function useResizeObserver(
    element: Signal<HTMLElement | undefined>,
    onResize: QRL<() => void>
  ) {
    
    useVisibleTask$(({ track }) => {
      track(() => element.value);
  
      let rAF = 0;
      if (element.value) {
        const resizeObserver = new ResizeObserver(() => {
          cancelAnimationFrame(rAF);
          rAF = window.requestAnimationFrame(onResize);
        });
        resizeObserver.observe(element.value);
  
        return () => {
          window.cancelAnimationFrame(rAF);
          if (element.value) {
            resizeObserver.unobserve(element.value);
          }
        };
      }
    });
  }