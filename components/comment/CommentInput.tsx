"use client";

import { useTransition } from "react";
import { createComment } from "@/action/createComment";

import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

function CommentInput({
    postId,
    parentCommentId,
}: {
    postId: string;
    parentCommentId?: string;
}) {
    const [content, setContent] = useState("");
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const { user } = useUser();
    const handleSubmit =(e:React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault()
        startTransition(async () => {
            try {
                const result = await createComment({
                    postId,
                    parentCommentId,
                    content,
                });
                if (result.error) {
                    console.error("Error adding comment:", result.error);
                } else {
                    // Clear input after successful submission
                    setContent("");
                    // Refresh the page to show the new comment
                    router.refresh();
                }
            } catch (error) {
                console.error("Failed to add comment:", error);
            }
        });
    }
    return (
        <form
        onSubmit={handleSubmit} className="flex gap-2 mt-2">
            <Input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                type="text"
                placeholder={user ? "Add a comment..." : "Sign in to comment"}
                disabled={isPending || !user}
            />
            <Button
            variant={"outline"}
                type="submit"
                disabled={isPending || !user || content.length === 0}
            >
                {isPending ? "Commenting..." : "Comment"}
            </Button>
        </form>
    );
}

export default CommentInput;