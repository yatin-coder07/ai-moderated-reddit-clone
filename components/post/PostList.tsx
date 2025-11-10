import { getPosts } from '@/sanity/lib/post/getPost';
import { currentUser } from '@clerk/nextjs/server'
import React from 'react'
import Posts from './Post';


const PostList = async() => {
    const user = await currentUser();
    const posts = await getPosts();
  return (
    <div className="space-y-4">
    {posts.map((post) => (
        <Posts key={post._id} post={post}
        userId={user?.id || null} />
    ))}
</div>
  )
}

export default PostList