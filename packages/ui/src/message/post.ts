import { QueryPlan } from "./query"

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


export const fakePosts = (): UserPost[] => {
    const userPosts: UserPost[] = []
    for (let i = 0; i < 10; i++) {
        userPosts.push({
            id: i.toString(),
            content: 'This is a test post',
            createdAt: new Date().toISOString(),
            likeCount: 1,
            replyCount: 2,
            userLiked: 1,
            author: fakeUser()
        })
    }
    return userPosts
}
export function messageQuery (q: QueryPlan<{id: string},[]>, props: {id: string})  {

}
