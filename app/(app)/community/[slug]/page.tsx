

import Posts from "@/components/post/Post";
import { urlFor } from "@/sanity/lib/image";
import { getPostsForSubreddit } from "@/sanity/lib/subreddits/getPostForSubreddit";



import { getSubredditBySlug } from "@/sanity/lib/subreddits/getSubredditBySlug";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";

async function CommunityPage({
    params,
}: {
    params: Promise<{ slug: string }>;
    
}) {
    const { slug } = await params;

    const community = await getSubredditBySlug(slug.toLowerCase());
    if (!community) return null;

    const user = await currentUser();
    const post = await getPostsForSubreddit(slug)

    return <>
  <section>
       
  </section>
 
    </>;
}

export default CommunityPage;