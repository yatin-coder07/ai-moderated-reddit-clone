import { sanityFetch } from "../live";
import { defineQuery } from "groq";

export async function getSubreddits() {
    // Execute Query
    const getSubredditsQuery = defineQuery(`*[_type == "subreddit"]{
        _id,
        title,
        "slug": slug.current,
        description,
        image,
        "moderator": moderator->,
        createdAt
    } | order(createdAt desc)`);

    const subreddits = await sanityFetch({query:getSubredditsQuery});

    return subreddits.data;

}