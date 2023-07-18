import { component$ } from "@builder.io/qwik";

interface Props {
  class?: string;
  svg: string;
  onClick$?: ()=>void
}
export const Icon = component$<Props>((props: Props) => {
  return <svg onClick$={props.onClick$} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke='currentColor' fill='currentColor' width="24" height="24" dangerouslySetInnerHTML={props.svg} class={'h-6 w-6 '+props.class??''}/>
});

export default Icon;
