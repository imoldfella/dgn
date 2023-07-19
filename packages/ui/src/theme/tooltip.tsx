import { Slot, component$ } from "@builder.io/qwik"

export const Tooltip = component$( (props: { text: string}) =>{
    return <div class="mx-auto flex h-screen w-full items-center justify-center flex-col bg-gray-200 py-20">
      <div class="group relative cursor-pointer py-2">
        <div class="absolute invisible bottom-7 group-hover:visible w-40 bg-white text-black px-4 mb-3 py-2 text-sm rounded-md">
          <p class=" leading-2 text-gray-600 pt-2 pb-2"> {props.text}</p>
          <svg class="absolute z-10  bottom-[-10px] " width="16" height="10" viewBox="0 0 16 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 10L0 0L16 1.41326e-06L8 10Z" fill="white" />
          </svg>
        </div>
        <span class="underline hover:cursor-pointer"><Slot/> </span>
      </div>
    </div>
  })
  
  // show green bubble if count > 0
  type IconProps = {  class?: string, color?: string, count?: number, onClick?: () => void }
export const GraphicIcon = component$((props: IconProps)=> {
    return <button onClick$={props.onClick}>
      <div class={'relative ' + props.class ?? ""}>
        <div class='w-6 h-6 '>
          <Slot/>
        </div>
       {(props.count ?? 0 > 0) && <span class="absolute right-0 top-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-white"></span>}
      </div></button>
  })