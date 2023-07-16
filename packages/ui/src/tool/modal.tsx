/* eslint-disable @typescript-eslint/no-unused-vars */
import { HTMLAttributes, Signal, component$, useSignal } from "@builder.io/qwik";
import { JSX } from "@builder.io/qwik/jsx-runtime";

export type DivProps = HTMLAttributes<HTMLDivElement>;

export namespace Dialog {
  export const Frame = component$<DivProps&{ open: Signal<boolean>}>((props) => {
    return <div></div>
  })
  export const Overlay = component$<DivProps&{as?: any}>((props) => {
    return <div></div>
  })
}

interface ModalProps{ open: Signal<boolean>, children: JSX.Element }

const Modal = component$<ModalProps>((props) => {
  return <Dialog.Frame class="fixed inset-0 z-10" open={props.open} >
      <div class="flex flex-col justify-center h-full px-1 pt-4 text-center sm:block sm:p-0">
        <Dialog.Overlay
          as={motion.div}
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            transition: { duration: 0.4, ease: [0.36, 0.66, 0.04, 1] },
          }}
          exit={{
            opacity: 0,
            transition: { duration: 0.3, ease: [0.36, 0.66, 0.04, 1] },
          }}
          class="fixed inset-0 bg-black/40"
        />

        <motion.div
          initial={{ y: "100%" }}
          animate={{
            y: 0,
            transition: { duration: 0.4, ease: [0.36, 0.66, 0.04, 1] },
          }}
          exit={{
            y: "100%",
            transition: { duration: 0.3, ease: [0.36, 0.66, 0.04, 1] },
          }}
          class="z-0 flex flex-col w-full h-full bg-white rounded-t-lg shadow-xl"
        >
          {children}
        </motion.div>
      </div>
      </>
    </Dialog>
        })


// framer motion
export function AnimatePresence(props: { children: any }) {
  return <div></div>
}
export namespace motion {
  interface MotionProps {
    initial: any
    animate: any
    exit: any
  }
  export const div = component$<DivProps&MotionProps>(() => {
    return <div></div>
  })
}
export namespace Icons {
  export function PlusIcon(props: { class: string }) {
    return <div></div>
  }
}



export const Example = component$(() => {
  const open = useSignal(false);

  return (
    <>
      <div class="relative p-4 border-b">
        <h1 class="text-xl font-semibold text-center">Favorites</h1>
        <div class="absolute inset-y-0 flex items-center justify-center left-4">
          <button onClick$={() => open.value = (true)} class="text-blue-500">
            <Icons.PlusIcon class="w-5 h-5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && <AddFavorite open={open} />}
      </AnimatePresence>
    </>
  );
})

type AddFavoriteProps = { open: Signal<boolean> };
const AddFavorite = component$<AddFavoriteProps>((props) => {
  const { data: users } = { data: [{ id: 1, name: "John Doe" }] };

  return <Modal open={props.open}>
    <div>
      <div class="flex flex-col h-full pt-3">
        <div class="px-3 pb-4 shadow-sm">
          <p class="text-xs">Choose a contact to add to Favorites</p>

          <div class="relative mt-5 text-center">
            <span class="font-medium">Contacts</span>
            <div class="absolute inset-y-0 right-0">
              <button
                class="mr-1 text-blue-500 focus:outline-none"
                onClick$={()=>props.open.value = (false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

        <div class="flex-1 overflow-y-scroll">
          {!users ? (
            <div class="flex items-center justify-center pt-12">
              <div></div>
            </div>
          ) : (
            <>
              <ul class="px-3 text-left">
                {users.map((user: any) => (
                  <li key={user.id} class="py-2 border-b border-gray-100">
                    {user.name}
                  </li>
                ))}
              </ul>

              <p class="pt-4 pb-10 font-medium text-center text-gray-400">
                {users.length} Contacts
              </p>
            </>
          )}
        </div>
      </div></div>
    </Modal>
})



