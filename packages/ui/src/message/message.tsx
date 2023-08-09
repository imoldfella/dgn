import { component$, $, useResource$, useVisibleTask$, useStore, useSignal, Slot, JSXNode } from "@builder.io/qwik"
import { Icon } from "../headless"
import { bubbleLeft, elipsis, heartOutline, heartSolid } from "../theme"
import { Image } from "@unpic/qwik"
import { timeAgo } from './dates'
import { RoutingLocation, useLocation, useNavigate } from "../provider"
import { Button } from "./toast"
import { User, UserPost, fakePosts, fakeUser, messageQuery } from "./post"
import { QueryBody, Query, QueryResult, newQuery, } from "./query"
import { JSX } from "@builder.io/qwik/jsx-runtime"



export const PostHeader = component$<{
    user: User | null
}>(({ user }) => {
    if (!user) user = fakeUser()

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

export const PostItem = component$(({ post, isInReplyTree }: any) => {
    //const session = useAuthSession()

    const nav = useNavigate()
    const MoreButton = component$(() => {
        return null
        const more = $(() => {

        })
        //   return <div preventdefault:mousedown class="hs-tooltip inline-block [--trigger:click] [--placement:bottom] absolute right-1 top-1">
        //   <a class="hs-tooltip-toggle block text-center" href="javascript:;">
        //     <span class="w-10 h-10 inline-flex justify-center items-center gap-2 rounded-md bg-gray-50 border border-gray-200 text-gray-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/[.05] dark:hover:border-white/[.1] dark:hover:text-white">
        //     <Icon svg={elipsis} class='h-6 w-6'  />
        //     </span>
        //     <div class="hs-tooltip-content hs-tooltip-shown:opacity-100 hs-tooltip-shown:visible opacity-0 transition-opacity inline-block absolute invisible z-10 py-3 px-4 bg-white border text-sm text-gray-600 rounded-md shadow-md dark:bg-gray-900 dark:border-gray-700 dark:text-gray-400" role="tooltip">
        //       Bottom popover
        //     </div>
        //   </a>
        // </div>

        return <div class='absolute right-1 top-1 text-neutral-500 group z-50 hs-tooltip inline-block '>
            <button class='p-1 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-700 group-hover:text-blue-700 hs-tooltip-toggle'>
                <Icon svg={elipsis} class='h-6 w-6' onClick$={more} />
            </button>
            <div class="hs-tooltip-content hs-tooltip-shown:opacity-100 hs-tooltip-shown:visible opacity-100 transition-opacity inline-block absolute invisible z-10 py-3 px-4 bg-white border text-sm text-gray-600 rounded-md shadow-md dark:bg-gray-900 dark:border-gray-700 dark:text-gray-400" role="tooltip">
                Bottom popover
            </div>
        </div>
    })
    const Likes = component$(() => {
        return <div
            class="group absolute bottom-[0.4rem] left-[4.25rem] flex cursor-pointer items-center"
            onClick$={async () => {
                if (post.userLiked) {
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
                class={`pointer-events-none h-8 w-8 items-center justify-center text-xl ${post.userLiked
                    ? 'text-pink-500 dark:text-pink-600'
                    : 'text-stone-500 dark:text-gray-400'
                    } group-hover:bg-pink-500 group-hover:bg-opacity-[0.15] group-hover:text-pink-500 group-hover:dark:text-pink-600`}
            >
                {post.userLiked ? <Icon svg={heartSolid} /> : <Icon svg={heartOutline} class='stroke-2' />}
            </Button>
            <span
                class={`pl-1 pr-3 text-sm ${post.userLiked
                    ? 'text-pink-500 dark:text-pink-600'
                    : 'text-stone-500 dark:text-gray-400'
                    } group-hover:text-pink-500 group-hover:dark:text-pink-600`}
            >
                {post.likeCount}
            </span>
        </div>
    })
    const Replies = component$(() => {
        return <div
            class="group absolute bottom-[0.4rem] left-[8rem] flex cursor-pointer items-center"
            onClick$={async () => nav(`/${post.author?.username}/status/${post.id}`)}
        >
            <Button
                variant="ghost"
                aria-label="Like"
                class='pointer-events-none h-8 w-8 items-center justify-center text-xl text-stone-500 group-hover:bg-blue-500 group-hover:bg-opacity-[0.15] group-hover:text-blue-500 dark:text-gray-400 group-hover:dark:text-blue-500'
            >
                <Icon svg={bubbleLeft} class='stroke-2' />
            </Button>
            <span
                class={`pl-1 pr-3 text-sm text-stone-500 group-hover:text-blue-500 dark:text-gray-400 group-hover:dark:text-blue-500`}
            >
                {post.replyCount}
            </span>
        </div>
    })

    const Author = component$(() => {
        return <a
            href={`/${post.author?.username}`}
            class="absolute left-[4.75rem] top-3 z-[1] flex "
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
    })

    const Avatar = component$(() => {
        return <a href={`/${post.author?.username}`} class="absolute left-3 top-3 z-[2]">
            <img
                src={post.author?.image ?? ''}
                alt="user avatar"

                width={48}
                height={48}
                class="z-0 rounded-full" />
        </a>
    })
    // border-b-[1px]
    return (
        <article
            class='relative flex bg-white hover:bg-stone-50 dark:bg-black dark:hover:bg-neutral-900 '
        >
            <Avatar />
            <MoreButton />
            <Author />
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
            <Likes />
            <Replies />
        </article>
    )
})

//   {isInReplyTree && (
// <div class="absolute left-9 top-3 z-[1] h-full w-[2px] bg-stone-200 dark:bg-slate-600" />
// )}


//           <h1 class="py-3 text-xl font-semibold">Home</h1>

export const Header = component$(() => {
    // border-x-[1px] border-b-[1px]
    return (
        <header class="fixed left-0 z-[10] flex w-full justify-center">
            <div class="w-[600px] max-w-full   px-3 backdrop-blur-lg ">
            </div>
        </header>
    )
})

type Row<T> = T & { y: number }


// each location represents a query. If there is no query or the user is not allowed to see the query, then we need to 404. The 404 can potentially trigger a sign in.
export const QueryStream = component$<{ query: QueryAst
}>((props) => {
    const loc = useLocation()

    // queries need to be async. query starts in loading state.
    const query = useStore(newQuery<UserPost>())

    useVisibleTask$(({ track, cleanup }) => {
        track(() => loc)
        messageQuery(query, { id: loc.id }, cleanup)
    })
    return <>
        {query.found && <><div class='fixed z-40' >
            {query.averageHeight} {query.measuredHeight} {query.length} {query.cache.length} {query.totalHeight} {query.item[0]?.start}
        </div>
        <Query
            query={query}
        >
            {/* header would go here */}
            <QueryBody
                for={$((index: number) => {
                    return <PostItem post={query.cache[index]} />
                })}
            />
        </Query>
        </>}
    </>
})

export const MessageStreamMockup = component$(() => {
    const inner = useSignal<HTMLDivElement>()
    const outer = useSignal<HTMLDivElement>()
    const lines: string[] = []
    for (let i = 0; i < 100; i++) {
        lines.push(`line ${i}`)
    }
    useVisibleTask$(() => {
        outer.value?.addEventListener('scroll', (e) => {
            //console.log('scroll', outer.value!.scrollTop)
        })
        outer.value!.scrollTop = 400
    })
    return <div ref={outer} class='w-full bg-neutral-800 h-screen overflow-y-auto'>
        <div ref={inner} style={{
            height: '10000px',
            position: 'relative'
        }}>
            {
                lines.map((line, index) => <div style={
                    {
                        position: 'absolute',
                        top: `${index * 20}px`
                    }
                } key={index}>{line}</div>)
            }
        </div>
    </div>
})
