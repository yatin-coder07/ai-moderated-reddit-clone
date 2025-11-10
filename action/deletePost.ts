'use server'

import { adminClient } from "@/sanity/lib/adminClient";
import { getPostById } from "@/sanity/lib/post/getPostById";
import { currentUser } from "@clerk/nextjs/server";

export const deletePost = async (postId: string) => {
    const user = await currentUser();
    if (!user) {
        return { error: "User not found" };
    }

    const post = await getPostById(postId);
    if (!post) {
        return { error: "Post not found" };
    }

    console.log(post);
    console.log(post.author?._id, user?.id);

    if (post.author?._id !== user?.id) {
        return { error: "You are not authorized to delete this post" };
    }

    // Add your actual deletion logic here
    // For example:
    // await adminClient.delete(postId);
    const patch = adminClient.patch(postId);

// Delete image from post
if (post.image?.asset?._ref) {
    patch.set({
        image: null
    });
}

// Set post to deleted and update content
patch.set({
    isDeleted: true,
    body: [{ 
        _type: "block",
        children: [{ 
            _type: "span", 
            text: "[DELETED CONTENTS]" 
        }]
    }],
    title: "[DELETED POST]"
});

// Commit changes
const result = await patch.commit();

if (result) {
    // Wait for 1 second before deleting the image asset
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Deleting image from post");
    
    if (post.image?.asset?._ref) {
        await adminClient.delete(post.image.asset._ref);
    }
}

// Return success message
return { success: "Post deleted successfully" };
    return { success: true };
}