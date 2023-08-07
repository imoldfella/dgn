
import { Signal, noSerialize, useSignal, useStore, useVisibleTask$ } from '@builder.io/qwik'
import {
  elementScroll,
  observeElementOffset,
  observeElementRect,
  observeWindowOffset,
  observeWindowRect,
  PartialKeys,
  Virtualizer,
  VirtualizerOptions,
  windowScroll,
} from '../virtual'
import { isServer } from '@builder.io/qwik/build'
import { NoSerialize } from '@builder.io/qwik';
export * from '../virtual'

//

// const useIsomorphicLayoutEffect =
//   typeof document !== 'undefined' ? React.useLayoutEffect : React.useEffect

function useVirtualizerBase<
  TScrollElement extends Element | Window,
  TItemElement extends Element,
>(
  options: VirtualizerOptions<TScrollElement, TItemElement>,
): Virtualizer<TScrollElement, TItemElement> {
  //const rerender = React.useReducer(() => ({}), {})[1]

  const resolvedOptions: VirtualizerOptions<TScrollElement, TItemElement> = {
    ...options,
    onChange: (instance) => {
      //rerender() - use signal?
      options.onChange?.(instance)
    },
  }

  const instance = useStore(new Virtualizer<TScrollElement, TItemElement>(resolvedOptions),
  )

  //instance.setOptions(resolvedOptions)

  // React.useEffect(() => {
  //   return instance._didMount()
  // }, [])

  // useIsomorphicLayoutEffect(() => {
  //   return instance._willUpdate()
  // })

  return instance
}

export function useVirtualizer<
  TScrollElement extends Element,
  TItemElement extends Element,
>(
  options: PartialKeys<
    VirtualizerOptions<TScrollElement, TItemElement>,
    'observeElementRect' | 'observeElementOffset' | 'scrollToFn'
  >,
){

  const s = useSignal<NoSerialize<Virtualizer<TScrollElement, TItemElement>>>()
  useVisibleTask$(() => {
    if (isServer) return
    s.value =  noSerialize(new Virtualizer<TScrollElement, TItemElement>({
      onChange: (instance) => {},
      observeElementRect: observeElementRect,
      observeElementOffset: observeElementOffset,
      scrollToFn: elementScroll,
      ...options,
    }))
  })

  return s
}

export function useWindowVirtualizer<TItemElement extends Element>(
  options: PartialKeys<
    VirtualizerOptions<Window, TItemElement>,
    | 'getScrollElement'
    | 'observeElementRect'
    | 'observeElementOffset'
    | 'scrollToFn'
  >,
): Virtualizer<Window, TItemElement> {
  return useVirtualizerBase<Window, TItemElement>({
    getScrollElement: () => (typeof document !== 'undefined' ? window : null),
    observeElementRect: observeWindowRect,
    observeElementOffset: observeWindowOffset,
    scrollToFn: windowScroll,
    ...options,
  })
}
