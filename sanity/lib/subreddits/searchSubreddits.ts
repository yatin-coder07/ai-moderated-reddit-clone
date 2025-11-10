import { sanityFetch } from "../live";
import { defineQuery } from "next-sanity";

export async function searchSubreddits(searchTerm: string) {
    // Skip empty search terms
    if (!searchTerm || searchTerm.trim() === "") {
        return [];
    }

    // Execute Query
    const searchSubredditsQuery = defineQuery(`
        *[_type == "subreddit" && title match $searchTerm + "*"] {
            _id,
            title,
            "slug": slug.current,
            description,
            image,
            "moderator": moderator->,
            createdAt
        } | order(createdAt desc)
    `);

    const results = await sanityFetch({
        query: searchSubredditsQuery,
        params: { searchTerm: searchTerm.toLowerCase() },
    });

    return results.data;
}