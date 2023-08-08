
import { QueryResult, VirtualItem } from "./query"

import { faker  } from '@faker-js/faker'
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
export const fakePosts = (start: number, limit: number): UserPost[] => {
    const userPosts: UserPost[] = []
    for (let i = 0; i < limit; i++) {
        userPosts.push({
            id: i.toString(),
            content: `This is a test post ${start+i}` + faker.lorem.paragraphs(2),
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
export async function messageQuery (
    q: QueryResult<UserPost>, 
    props: {id: string}, 
    cleanup: CleanupFn)  {
    q.length = 100
    q.anchorKey = []
    q.cacheStart = 0
    q.cache = fakePosts(0, 100)
    q.averageHeight = 48
    q.item = q.cache.map((_,index)=>{
        const o : VirtualItem ={
            index: 0 + index,
            key: 0+index+"",
            start: 0,
            end: 0,
            size: 0,
            lane: 0
        }
        return o
    })
}   

// we potentially want multiple indices, or at least a way to have different threads sort in different ways. Each query will have a key.