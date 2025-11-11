"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useUser } from "@clerk/nextjs"
import { useRef, useState, useTransition } from "react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { ImageIcon } from "lucide-react";
import Image from "next/image";
import { Button } from "./ui/button";
import { createCommunity } from "@/action/createCommunity";
import { useRouter } from "next/navigation";


const CreateCommunityButton = () => {
    const {user} = useUser();
    const router = useRouter();
    const [open , setOpen] = useState<boolean>(false);
    const [errorMessage , setErrorMessage]=useState<string>("");
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [description, setDescription] = useState("");
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageSize, setImageSize] = useState<string>("");
    const[isPending , startTransition]=useTransition();


    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setName(value);

        if (!slug || slug === generateSlug(name)) {
            setSlug(generateSlug(value));
        }
    };

    const generateSlug = (text: string) => {
        return text
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "")
            .slice(0, 21);
    };

    const removeImage = () => {
        setImagePreview(null);
        setImageFile(null);
        setImageSize("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const compressImage = (file: File, maxSizeKB: number = 500): Promise<File> => {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new window.Image();

            img.onload = () => {
                const maxDimension = 800;
                let { width, height } = img;

                if (width > height) {
                    if (width > maxDimension) {
                        height = (height * maxDimension) / width;
                        width = maxDimension;
                    }
                } else {
                    if (height > maxDimension) {
                        width = (width * maxDimension) / height;
                        height = maxDimension;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                ctx?.drawImage(img, 0, 0, width, height);

                let quality = 0.8;
                const tryCompress = () => {
                    canvas.toBlob((blob) => {
                        if (blob && blob.size <= maxSizeKB * 1024) {
                            const compressedFile = new File([blob], file.name, {
                                type: 'image/jpeg',
                                lastModified: Date.now(),
                            });
                            resolve(compressedFile);
                        } else if (quality > 0.1) {
                            quality -= 0.1;
                            tryCompress();
                        } else {
                            resolve(file);
                        }
                    }, 'image/jpeg', quality);
                };

                tryCompress();
            };

            img.src = URL.createObjectURL(file);
        });
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setErrorMessage("Image must be smaller than 5MB.");
            return;
        }

        if (!file.type.startsWith('image/')) {
            setErrorMessage("Invalid file type. Select an image file.");
            return;
        }

        try {
            const compressedFile = await compressImage(file, 500);
            setImageFile(compressedFile);

            const sizeKB = Math.round(compressedFile.size / 1024);
            setImageSize(`${sizeKB}KB`);

            const reader = new FileReader();
            reader.onload = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(compressedFile);

        } catch (error) {
            setErrorMessage("Failed to process image.");
        }
    };

    const resetForm = () => {
        setName("");
        setSlug("");
        setDescription("");
        setImagePreview(null);
        setImageFile(null);
        setImageSize("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleCreateCommunity = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!name.trim()) {
            setErrorMessage("Community name is required.");
            return;
        }

        if (!slug.trim()) {
            setErrorMessage("Community slug is required.");
            return;
        }

        startTransition(async () => {
            try {
                let imageBase64: string | null = null;
                let fileName: string | null = null;
                let fileType: string | null = null;

                if (imageFile) {
                    imageBase64 = await new Promise<string>((resolve) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result as string);
                        reader.readAsDataURL(imageFile);
                    });
                    fileName = imageFile.name;
                    fileType = imageFile.type;
                }

                const result = await createCommunity(
                    name.trim(),
                    imageBase64,
                    fileName,
                    fileType,
                    slug.trim(),
                    description.trim() || undefined
                );

                if (result && "error" in result) {
                    setErrorMessage(result.error);
                } else if (result?.subreddit?._id) {
                    setOpen(false);
                    resetForm();
                    router.push(`/community/${result.subreddit._id}`)
                }

            } catch {
                setErrorMessage("Error creating community.");
            }
        });
    };

    return (
        <div>
            <Dialog  open={open} onOpenChange={setOpen}>
                <DialogTrigger
                    className="w-full p-2 pl-12 flex items-center rounded-md cursor-pointer bg-black text-white hover:bg-black transition-all duration-200 disabled:text-sm disabled:opacity-50 disabled:cursor-not-allowed text-center"
                    disabled={!user}
                >
                    {!user ? "sign in to create Community":"Create Community +"}
                </DialogTrigger>

                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create a Community!</DialogTitle>
                        <DialogDescription>
                            Create a community/subreddit to share ideas and feedback.
                        </DialogDescription>

                        <form onSubmit={handleCreateCommunity} className="space-y-4 mt-2">
                            {errorMessage && <div className="text-red-500 text-sm">{errorMessage}</div>}

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Community Name</label>
                                <Input value={name} onChange={handleNameChange} required minLength={3} maxLength={21}/>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Slug</label>
                                <Input value={slug} onChange={(e)=>setSlug(e.target.value)} required/>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <Textarea value={description} onChange={(e)=>setDescription(e.target.value)} rows={3}/>
                            </div>

                            <div className="relative w-24 h-24 mx-auto">
                                {imagePreview ? (
                                    <>
                                        <Image src={imagePreview} alt="Preview" fill className="object-cover rounded-full" />
                                        <button type="button" onClick={removeImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center">×</button>
                                        {imageSize && <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs bg-white px-2 py-1">{imageSize}</div>}
                                    </>
                                ) : (
                                    <label className="border border-dashed rounded-lg p-3 text-center cursor-pointer">
                                        <ImageIcon className="mx-auto w-6 h-6"/>
                                        <input type="file" className="hidden" ref={fileInputRef} onChange={handleImageChange}/>
                                    </label>
                                )}
                            </div>

                            <Button type="submit" disabled={isPending || !user}>
                                {isPending ? "Creating..." : "Create Community"}
                            </Button>
                        </form>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default CreateCommunityButton
