import { component$, useSignal, useVisibleTask$,useTask$,$ } from "@builder.io/qwik"
import { blueButton } from "../theme"
import { Button, Spinner, CircularProgress } from "./button"
import { useCSSTransition } from "./transition"
import { User } from "./post"


export interface GetManyPosts { }
export interface DefaultSession { }
export const PostForm = component$<{
    posts: GetManyPosts
    user: User
}>(({ posts, user }) => {
const content = useSignal('')
const inputFocused = useSignal(false)

const charLimit = 280
const charLeft = charLimit - content.value.length

const loading = useSignal(false)
const errorMessage = useSignal('')
const toastVisible = useSignal(false)

// enterFrom animation wasn't working w/ shouldMount and transitionOnAppear so that was left out
const { stage, shouldMount } = useCSSTransition(toastVisible, { timeout: 300 })

const textareaRef = useSignal<HTMLTextAreaElement>()

useVisibleTask$(({ cleanup }) => {
    const setHeight = () => {
        if (textareaRef.value) {
            textareaRef.value.style.height = 'auto'
            textareaRef.value.style.height = `${textareaRef.value.scrollHeight}px`
        }
    }
    textareaRef.value?.addEventListener('input', setHeight)

    const focus = () => (inputFocused.value = true)
    textareaRef.value?.addEventListener('focus', focus)

    const blur = () => {
        inputFocused.value = false

        if (content.value.length === 0) {
            textareaRef.value?.style.removeProperty('height')
        }
    }
    textareaRef.value?.addEventListener('blur', blur)

    cleanup(() => {
        textareaRef.value?.removeEventListener('input', setHeight)
        textareaRef.value?.removeEventListener('focus', focus)
        textareaRef.value?.removeEventListener('blur', blur)
    })
})

return (
    <form
        onSubmit$={async () => {
            loading.value = true

            const newPost = {
                code: 100,
                data: '',
                message: ''
            } //await addPost({ content: content.value })

            if (newPost.code !== 200 || !newPost.data) {
                loading.value = false

                errorMessage.value = newPost.message
                toastVisible.value = true

                return
            }

            loading.value = false

            content.value = ''

            //posts.unshift(newPost.data)
        }}
        preventdefault:submit
        class="flex min-h-[5.25rem] border-b-[1px] px-3"
    >
        <img
            src={user?.image ?? ''}
            alt="user avatar"
            width={48}
            height={48}
            class="mt-4 h-[48px] w-[48px] rounded-full"
        />

        <textarea
            id="tweet"
            ref={textareaRef}
            bind:value={content}
            placeholder="What is happening?!"
            class="mt-5 flex-grow resize-none overflow-hidden bg-transparent px-3 py-2 text-xl focus:outline-none"
            rows={1}
        />
        <div class="flex flex-col justify-between">
            <Button
                disabled={
                    loading.value ||
                    content.value.length === 0 ||
                    content.value.length > charLimit
                }
                type="submit"
                class={blueButton}
                aria-label="post"
            >
                {loading.value ? <Spinner /> : 'Share'}
            </Button>
            {inputFocused.value || content.value.length > 0 ? (
                <div class="mb-3 mt-3 flex">
                    <CircularProgress current={content.value.length} />
                    <span
                        class={`${charLeft <= 0
                                ? 'text-red-600'
                                : charLeft <= 20
                                    ? 'text-yellow-400'
                                    : 'text-stone-500 dark:text-gray-400'
                            } ml-2`}
                    >
                        {charLeft}
                    </span>
                </div>
            ) : null}
        </div>
        {/* <Toast
            stage={stage}
            message={errorMessage.value}
            onClose={$(() => (toastVisible.value = false))}
        /> */}
    </form>
)
})

