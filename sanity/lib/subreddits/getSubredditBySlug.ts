import { defineQuery } from "groq";
import { sanityFetch } from "../live";

export async function getSubredditBySlug(slug: string) {
  const query = defineQuery(`
    *[_type == "subreddit" && slug.current == $slug][0]{
      _id,
      title,
      description,
      "slug": slug.current,
      image,
      moderator->{
        _id, name
      }
    }
  `);

  const { data } = await sanityFetch({
    query,
    params: { slug },
  });

  return data; // data is now the single community object or null
}
