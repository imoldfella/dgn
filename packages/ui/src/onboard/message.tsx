import { HTMLAttributes, PropFunction, Slot, component$, useSignal, useVisibleTask$ } from "@builder.io/qwik"
import { Icon } from "../headless"
import { $localize, LanguageSelect, useLocale } from "../i18n"
import { DarkButton, personIcon,search } from "../theme"
import { cart } from "../theme"
import { Image } from "@unpic/qwik"
import { timeAgo } from './dates'
import {
    HiHeartOutline,
    HiHeartSolid,
    HiChatBubbleOvalLeftOutline,
  } from '@qwikest/icons/heroicons'
import { useNavigate } from "../provider"

// import {
//   HiHeartOutline,
//   HiHeartSolid,
//   HiChatBubbleOvalLeftOutline,
// } from '@qwikest/icons/heroicons'


export const DatagroveHeader = component$(() => {
    return <div class='flex'><SearchBox/><LanguageSelect /><DarkButton/></div>
})
interface User {
  username: string
  displayName: string
  image: string
  }
interface UserPost {
    id: string
    content: string
    createdAt: string
    likeCount: string
    replyCount: string
    userLiked: number
    author: User
}
export const fakePosts = () : UserPost[] => {
    const userPosts : UserPost[] = []
    for (let i = 0; i < 10; i++) {
        userPosts.push({
            id: i.toString(),
            content: 'This is a test post',
            createdAt: new Date().toISOString(),
            likeCount: '0',
            replyCount: '0',
            userLiked: 0,
            author: {
                username: 'test',
                displayName: 'Test User',
                image: 'https://avatars.githubusercontent.com/u/5510808?v=4',
            },
          })
    }
    return userPosts
}




// Datagrove home. This will generally be like social media, get to standalone websites for shopping etc.

export const SearchBox = component$(() => {
    return <div class='flex-1 m-2 flex items-center shadow  bg-neutral-800  rounded-lg px-1'
                > <Icon svg={search} class='dark:text-white h-6 w-6' />
                    <input autoFocus
                        class=" flex-1 border-0 focus:ring-0 focus:outline-none bg-transparent dark:text-white"
                        placeholder={$localize`Search Datagrove`} type="search" /></div>
 
  
})

export const Cart = component$(() => {
    return <Icon svg={cart} class='dark:text-white h-6 w-6' />
})

//         <div class='w-48 '><LanguageSelect /></div><DarkButton />
export const GuestPage = component$(() => {
   
    const ln = useLocale()

    return <><div dir={ln.dir} class='px-2 space-x-1 my-2 fixed w-screen flex flex-row items-center'>
        <div><Slot name='top-left' /></div>
        <div class='flex-1 ' />
        <Cart/>
    </div>
        <div class="flex items-center justify-center w-screen h-screen">
            <div class='w-96'>
                <Slot />
            </div>
        </div>
    </>
})



export const PostHeader = component$<{
    user: User | null
  }>(({ user }) => {
    if (!user) return null
  
    return (
      <section class="p-3">
        <a class="flex w-fit" href={`/${user.username}`}>
          <Image
            src={user.image}
            alt="user avatar"
            layout="constrained"
            width={48}
            height={48}
            class="rounded-full"
          />
          <div class="ml-3 flex flex-col justify-center">
            <span class="font-semibold hover:underline">{user.displayName}</span>
            <span class="truncate break-words leading-[15px] text-stone-500 dark:text-gray-400">
              @{user.username}
            </span>
          </div>
        </a>
      </section>
    )
  })
  



// const likePost = server$(async function ({ postId, action }: LikeInput) {
//   return api(this).likes.mutation.like({ postId, action })
// })

// interface Props {
//   post: GetManyPosts[0]
//   isInReplyTree?: boolean
// }

export const PostItem =  component$(({ post, isInReplyTree }: any) => {
  //const session = useAuthSession()

  const nav = useNavigate()

  return (
    <article
      class={`relative flex ${
        !isInReplyTree && 'border-b-[1px]'
      } bg-white hover:bg-stone-50 dark:bg-black dark:hover:bg-blue-1000`}
    >
      <a href={`/${post.author?.username}`} class="absolute left-3 top-3 z-[2]">
      <img
          src={post.author?.image ?? ''}
          alt="user avatar"
  
          width={48}
          height={48}
          class="z-0 rounded-full"/>
      </a>
      {isInReplyTree && (
        <div class="absolute left-9 top-3 z-[1] h-full w-[2px] bg-stone-200 dark:bg-slate-600" />
      )}
      <a
        href={`/${post.author?.username}`}
        class="absolute left-[4.75rem] top-3 z-[1] flex w-[calc(100%-72px)]"
      >
        {post.author?.displayName && (
          <span class="mr-1 max-w-[38%] truncate break-words font-semibold hover:underline sm:max-w-[43%]">
            {post.author.displayName}
          </span>
        )}
        <span class="max-w-[38%] truncate break-words text-stone-500 dark:text-gray-400 sm:max-w-[43%]">
          @{post.author?.username}
        </span>
        <span class="dark:text-gray-400 px-1 text-stone-500">·</span>
        <span class="text-stone-500 dark:text-gray-400">{timeAgo(post.createdAt)}</span>
      </a>
      <a
        href={`/${post.author?.username}/status/${post.id}`}
        class="flex w-full p-3 pb-[2.5rem]"
      >
        <div class="min-h-[48px] min-w-[60px]" />
        <div class="flex w-[calc(100%-60px)] flex-col">
          <div class="flex opacity-0">
            {post.author?.displayName && (
              <span class="mr-1 max-w-[38%] truncate break-words font-semibold hover:underline sm:max-w-[43%]">
                {post.author.displayName}
              </span>
            )}
            <span class="max-w-[38%] truncate break-words text-stone-500 dark:text-gray-400 sm:max-w-[43%]">
              @{post.author?.username}
            </span>
            <span class="px-1 text-stone-500 dark:text-gray-400">·</span>
            <span class="text-stone-500 dark:text-gray-400">
              {timeAgo(post.createdAt)}
            </span>
          </div>
          <p class="w-full whitespace-pre-wrap break-words">{post.content}</p>
        </div>
      </a>
      <div
        class="group absolute bottom-[0.4rem] left-[4.25rem] flex cursor-pointer items-center"
        onClick$={async () => {


          if (post.userLiked) {
            // optimistic update
            post.userLiked = 0
            post.likeCount = (parseInt(post.likeCount) - 1).toString()

            // send request to server
            //const unlike = await likePost({ postId: post.id, action: 'unlike' })

            // if (unlike.code !== 200) {
            //   // revert optimistic update
            //   post.userLiked = 1
            //   post.likeCount = (parseInt(post.likeCount) + 1).toString()
            // }
          } else {
            // optimistic update
            post.userLiked = 1
            post.likeCount = (parseInt(post.likeCount) + 1).toString()

            // send request to server
            // const like = await likePost({ postId: post.id, action: 'like' })

            // if (like.code !== 200) {
            //   // revert optimistic update
            //   post.userLiked = 0
            //   post.likeCount = (parseInt(post.likeCount) - 1).toString()
            // }
          }
        }}
      >
        <Button
          variant="ghost"
          aria-label="Like"
          class={`pointer-events-none h-8 w-8 items-center justify-center text-xl ${
            post.userLiked
              ? 'text-pink-500 dark:text-pink-600'
              : 'text-stone-500 dark:text-gray-400'
          } group-hover:bg-pink-500 group-hover:bg-opacity-[0.15] group-hover:text-pink-500 group-hover:dark:text-pink-600`}
        >
          {post.userLiked ? <HiHeartSolid /> : <HiHeartOutline class="stroke-2" />}
        </Button>
        <span
          class={`pl-1 pr-3 text-sm ${
            post.userLiked
              ? 'text-pink-500 dark:text-pink-600'
              : 'text-stone-500 dark:text-gray-400'
          } group-hover:text-pink-500 group-hover:dark:text-pink-600`}
        >
          {post.likeCount}
        </span>
      </div>
      <div
        class="group absolute bottom-[0.4rem] left-[8rem] flex cursor-pointer items-center"
        onClick$={async () => nav(`/${post.author?.username}/status/${post.id}`)}
      >
        <Button
          variant="ghost"
          aria-label="Like"
          class={`pointer-events-none h-8 w-8 items-center justify-center text-xl text-stone-500 group-hover:bg-blue-550 group-hover:bg-opacity-[0.15] group-hover:text-blue-550 dark:text-gray-400 group-hover:dark:text-blue-550`}
        >
          <HiChatBubbleOvalLeftOutline class="stroke-2" />
        </Button>
        <span
          class={`pl-1 pr-3 text-sm text-stone-500 group-hover:text-blue-550 dark:text-gray-400 group-hover:dark:text-blue-550`}
        >
          {post.replyCount}
        </span>
      </div>
    </article>
  )
})


interface ButtonProps extends HTMLAttributes<HTMLButtonElement> {
    variant?: 'ghost' | 'outline' | 'solid'
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    name?: string
  }
  
  export const Button =  component$((props: ButtonProps) => {
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
    //  <div class='p-2 dark:text-white'>
    //    <DatagroveHeader/>
    //    {userPosts.map((post) => (
    //           <PostItem key={post.id} post={post} />
    //         ))}
    //     </div> 
  export const MessageStream = component$(() => {

  // useVisibleTask$(({ cleanup }) => {
  //   const nearBottom = async () => {
  //     if (
  //       window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 &&
  //       !loadingMore.value
  //     ) {
  //       loadingMore.value = true

  //       const newPosts = await getMorePosts({ offset: posts.length })

  //       if (newPosts.code !== 200 || !newPosts.data) {
  //         loadingMore.value = false
  //         return
  //       }

  //       if (newPosts?.data?.length === 0) {
  //         window.removeEventListener('scroll', nearBottom)

  //         loadingMore.value = false
  //         return
  //       }

  //       posts.push(...newPosts.data)

  //       // small timeout to prevent multiple requests
  //       setTimeout(() => (loadingMore.value = false), 500)
  //     }
  //   }

  //   window.addEventListener('scroll', nearBottom)

  //   cleanup(() => window.removeEventListener('scroll', nearBottom))
  // })
  const loadingMore = useSignal(false)
    const posts : UserPost[] = fakePosts()
    return <>
    <div class="w-[600px] max-w-full flex-grow self-center border-l-[1px] border-r-[1px]">
      <Header />
      <section class="flex flex-col pb-32 pt-[3.3rem]">
        {session.value?.user && <PostForm posts={posts} user={session.value.user} />}
        {postsSignal.value.code !== 200 ? (
          <ErrorMessage message={postsSignal.value.message} />
        ) : (
          posts.map((post) => <PostItem key={post.id} post={post} />)
        )}

        {loadingMore.value ? (
          <div class="mt-14">
            <Spinner />
          </div>
        ) : (
          <div class="mt-14 h-2 w-2 self-center rounded-full bg-stone-200 dark:bg-slate-600" />
        )}
      </section>
    </div></>
})
export const Header =  component$(() => {
  return (
    <header class="fixed left-0 z-[10] flex w-full justify-center">
      <div class="w-[600px] max-w-full border-x-[1px] border-b-[1px] bg-white bg-opacity-50 px-3 backdrop-blur-lg dark:bg-blue-1100 dark:bg-opacity-50">
        <h1 class="py-3 text-xl font-semibold">Home</h1>
      </div>
    </header>
  )
})


export const Spinner =  component$(() => {
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

import { LuRotateCcw } from '@qwikest/icons/lucide'
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
            <LuRotateCcw />
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
              <LuRotateCcw />
            </div>
            <span class="ml-2 font-medium text-white">Try again</span>
          </Button>
        </a>
      )}
    </div>
  )
})