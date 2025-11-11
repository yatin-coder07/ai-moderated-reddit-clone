import { defineQuery } from "next-sanity";
import { sanityFetch } from "../live";

export async function getPostsForSubreddit(slug: string) {
  if (!slug) throw new Error("getPostsForSubreddit: slug is required");

  const query = defineQuery(`
    *[_type == "post" && subreddit->slug.current == $slug]{
      ...,
      "slug": slug.current,
      "author": author->,
      "subreddit": subreddit->,
      "category": category->,
      "upvotes": count(*[_type == "vote" && voteType == "upvote" && references(^._id)]),
      "downvotes": count(*[_type == "vote" && voteType == "downvote" && references(^._id)]),
      "netScore": count(*[_type == "vote" && voteType == "upvote" && references(^._id)])
               - count(*[_type == "vote" && voteType == "downvote" && references(^._id)]),
      "commentCount": count(*[_type == "comment" && references(^._id)])
    } | order(_createdAt desc)
  `);

  const { data } = await sanityFetch({
    query,
    params: { slug }, // e.g. "reactjs"
    // perspective: 'published', // uncomment if needed
  });

  return data; // <-- array of posts
}
