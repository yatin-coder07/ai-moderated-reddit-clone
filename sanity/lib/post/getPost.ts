import { sanityFetch } from "../live";
import { defineQuery } from "groq";
import type { Post } from "@/sanity.types";

export async function getPosts(): Promise<Post[]> {
    const getAllPostsQuery =
    defineQuery(`*[_type == "post" && isDeleted != true] {
    _type,
    _createdAt,
    _updatedAt,
    _rev,
    _id,
    title,
    "slug": slug.current,
    body,
    publishedAt,
    "author": author->,
    "subreddit": subreddit->,
    image,
    isDeleted
} | order(publishedAt desc)`);

    const posts = await sanityFetch({ query: getAllPostsQuery });

    return posts.data; 
}