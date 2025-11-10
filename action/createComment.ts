"use server";

import { getUser } from "@/sanity/lib/user/getUser";
import { addComment } from "@/sanity/lib/comment/addComment";

interface CreateCommentParams {
    postId: string;
    parentCommentId?: string;
    content: string;
}

export async function createComment({
    postId,
    parentCommentId,
    content,
}: CreateCommentParams) {
    try {
        const user = await getUser();
        if ("error" in user) {
            return { error: user.error };
        }

        const result = await addComment({
            postId,
            parentCommentId,
            content,
            userId: user._id,
        });

        return result;
    } catch (error) {
        console.error("Error creating comment:", error);
        return { error: "Failed to add comment" };
    }
}
