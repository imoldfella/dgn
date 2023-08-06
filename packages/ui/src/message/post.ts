
import { QueryResult, scrollPosition } from "./query"

export interface User {
    username: string
    displayName: string
    image: string
}
export interface UserPost {
    id: string
    content: string
    createdAt: string
    likeCount: number
    replyCount:  number
    userLiked: number
    author: User
}
export const fakeUser = (): User => {
    return {
        username: 'test',
        displayName: 'Test User',
        image: 'https://avatars.githubusercontent.com/u/5510808?v=4',
    }
}

// start at 
export const fakePosts = (start: any[], limit: number): UserPost[] => {
    const userPosts: UserPost[] = []
    for (let i = 0; i < 10; i++) {
        userPosts.push({
            id: i.toString(),
            content: `This is a test post ${i}`,
            createdAt: new Date().toISOString(),
            likeCount: 1,
            replyCount: 2,
            userLiked: 1,
            author: fakeUser()
        })
    }
    return userPosts
}
export type CleanupFn = (fn: ()=>void) => void

// start should be a primary key? otherwise when we come back we have no way to resume
export async function messageQuery (q: QueryResult<UserPost>, props: {id: string}, cleanup: CleanupFn)  {
    const sp = scrollPosition(props.id)
    q.length = 50000
    q.start = []
    q.row = fakePosts(q.start, 100)
}   
