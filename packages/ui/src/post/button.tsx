import { HTMLAttributes, component$, Slot, PropFunction } from "@builder.io/qwik"
import { Icon } from "../theme"

interface ButtonProps extends HTMLAttributes<HTMLButtonElement> {
    variant?: 'ghost' | 'outline' | 'solid'
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    name?: string
}


export const Spinner = component$(() => {
    return (
        <div role="status">
            <svg
                class="ml-auto mr-auto h-6 w-6 animate-spin text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
            >
                <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="white"
                    stroke-width="3"
                ></circle>
                <path
                    class="opacity-75"
                    fill="white"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
            </svg>
            <span class="sr-only">Loading...</span>
        </div>
    )
})

export const Button = component$((props: ButtonProps) => {
    const { variant = 'solid', class: className, ...otherProps } = props

    let variantStyle = ''

    if (variant === 'ghost') {
        variantStyle = `${className} flex rounded-full hover:bg-stone-500 dark:hover:bg-slate-200 hover:bg-opacity-[0.15] dark:hover:bg-opacity-[0.12] hover:backdrop-blur active:bg-stone-400 active:bg-opacity-30 dark:active:bg-slate-200 dark:active:bg-opacity-20`
    }

    if (variant === 'outline') {
        variantStyle = `${className} rounded-full border-[1px] bg-opacity-60 backdrop-blur hover:bg-stone-400 dark:hover:bg-slate-200 hover:bg-opacity-[0.15] dark:hover:bg-opacity-10 hover:backdrop-blur active:bg-stone-400 active:bg-opacity-30 dark:active:bg-slate-200 dark:active:bg-opacity-20`
    }

    if (variant === 'solid') {
        variantStyle = `${className} rounded-full text-white bg-blue-550 hover:bg-blue-650 active:bg-blue-650 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-550`
    }

    return (
        <button {...otherProps} class={variantStyle}>
            <Slot />
        </button>
    )
})
export const ErrorMessage = component$<{
    message?: string
    retryHref?: string
    retryAction?: PropFunction<() => void>
}>(({ message, retryAction, retryHref }) => {
    return (
        <div class="mt-4 flex flex-col items-center self-center">
            <h4 class="mb-2 text-xl font-semibold">Error</h4>
            <p class="text-stone-500 dark:text-gray-400">
                {message ?? 'Oops, something went wrong. Please try again later.'}
            </p>

            {retryAction ? (
                <Button
                    class="mt-5 flex w-[8.5rem] items-center justify-center py-2"
                    aria-label="retry"
                    onClick$={retryAction}
                >
                    <div class="text-xl text-white">
                        <Icon svg='personIcon' class='h-6 w-6' />
                    </div>
                    <span class="ml-2 font-medium text-white">Try again</span>
                </Button>
            ) : (
                <a href={retryHref ?? '/'}>
                    <Button
                        class="mt-5 flex w-[8.5rem] items-center justify-center py-2"
                        aria-label="retry"
                    >
                        <div class="text-xl text-white">
                        <Icon svg='personIcon' class='h-6 w-6' />
                        </div>
                        <span class="ml-2 font-medium text-white">Try again</span>
                    </Button>
                </a>
            )}
        </div>
    )
})


export const CircularProgress = component$<{
    current: number
    max?: number
}>(({ current, max = 280 }) => {
    const radius = 12

    const circumference = 2 * Math.PI * radius

    const progress = !current ? 0 : current > max ? 100 : (current / max) * 100

    return (
        <div
            x-data="scrollProgress"
            class="inline-flex -rotate-90 items-center justify-center overflow-hidden rounded-full"
        >
            <svg class="h-7 w-7">
                <circle
                    class="text-gray-200 dark:text-slate-600"
                    stroke-width="2"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="13"
                    cy="13"
                />
                <circle
                    class={`${max - current <= 0
                            ? 'text-red-600'
                            : current >= max - 20
                                ? 'text-yellow-400'
                                : 'text-blue-550'
                        }`}
                    stroke-width="2"
                    stroke-dasharray={circumference}
                    stroke-dashoffset={`${circumference - (progress / 100) * circumference}`}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="13"
                    cy="13"
                />
            </svg>
        </div>
    )
})
