import { defineQuery } from "groq";
import { sanityFetch } from "../live";

export async function getSubredditBySlug(slug: string) {
    const getSubredditBySlugQuery = defineQuery(`
    *[type=="subreddit" && slug.current == $slug[0] ]`)

    const subreddit = await sanityFetch({
        query: getSubredditBySlugQuery,
        params: { slug },
    })
    return subreddit.data
}