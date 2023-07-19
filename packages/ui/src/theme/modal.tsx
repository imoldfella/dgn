import { component$, Slot } from '@builder.io/qwik';
import { Icon } from '../headless';
import { xCircle } from '../i18n';

// why not a signal here?
export interface ModalStore {
  isOpen: boolean;
}

export interface ModalProps {
  title: string;
  store: ModalStore;
}
export function CloseButton() {
  return <Icon svg={xCircle} class='flex-none w-5 h-5 text-blue-700 hover-text-blue-500' />
}
export const Modal = component$(({ title, store }: ModalProps) => {
  if (store.isOpen)
    return (
      <div
        class="relative z-overlay"
        aria-labelledby={title}
        role="dialog"
        aria-modal="true"
      >
        <Overlay />

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex items-center justify-center min-h-full p-4 text-center sm:items-center sm:p-0">
            <Panel>
              <button onClick$={() => (store.isOpen = false)}>
                close modal
              </button>
              <Slot />
            </Panel>
          </div>
        </div>
      </div>
    );

  return null;
});

export const Overlay = component$(() => {
  return (
    <div class="fixed inset-0 transition-opacity bg-black bg-opacity-40 backdrop-blur-sm" />
  );
});

export const Panel = component$(() => {
  return (
    <div class="relative p-8 overflow-hidden text-left transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:w-full sm:max-w-lg">
      <Slot />
    </div>
  );
});
