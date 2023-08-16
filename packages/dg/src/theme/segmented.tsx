import { QRL } from "@builder.io/qwik"

/*
    <Segmented values={Segments} signal={tab} class='mx-2 mt-2 text-sm'/>
    
*/
// like select
export interface SegmentedProps {
    values: string[]
    selected: number
    onChange$ : QRL<(index: number) => void>
    class?: string
}

export const Segmented = (props: SegmentedProps) => {

    // this should always give us a lang?
  
    // maybe we should limit this to four some how? maybe we should adaptively change the representation (chips?) if we have too many.
    return <div class={`flex border border-neutral-500 rounded-md ${props.class}`}
    >   {props.values.map((e, index) => <button
        key={index}
        class={` ${ index == props.selected?"  font-semibold":"text-neutral-500"} flex-1 inline-flex w-full p-2 items-center justify-center whitespace-nowrap first:rounded-l-md border-r   hover:text-blue-500 hover:underline last:border-0 `}
        onClick$={()=> props.onChange$(index)}
      >{e}</button>)}

    </div>
  }