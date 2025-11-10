"use client"

import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { useUser } from "@clerk/nextjs"
import { use, useRef, useState, useTransition } from "react";
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
    
        // Auto-generate slug from name
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
                // Calculate new dimensions (max 800px width/height)
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
                
                // Try different quality levels until we get under the size limit
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
                            // If we can't compress enough, use the original file
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
        if (file) {
            // Check file size (max 5MB before compression)
            if (file.size > 5 * 1024 * 1024) {
                toast("File too large", {
                    description: "Please select an image smaller than 5MB"
                });
                return;
            }
            
            // Check file type
            if (!file.type.startsWith('image/')) {
                toast("Invalid file type", {
                    description: "Please select a valid image file"
                });
                return;
            }
            
            try {
                // Compress the image
                const compressedFile = await compressImage(file, 500); // 500KB max
                setImageFile(compressedFile);
                
                // Show file size
                const sizeKB = Math.round(compressedFile.size / 1024);
                setImageSize(`${sizeKB}KB`);
                
                const reader = new FileReader();
                reader.onload = () => {
                    const result = reader.result as string;
                    setImagePreview(result);
                };
                reader.readAsDataURL(compressedFile);
            } catch (error) {
                console.error('Error compressing image:', error);
                toast("Error processing image", {
                    description: "Please try a different image"
                });
            }
        }
    }

        const resetForm = () => {
            setName("");
            setSlug("");
            setDescription("");           
            setImagePreview(null);
            setImageFile(null);
            setImageSize("");
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          };

        const handleCreateCommunity = async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
          
            if (!name.trim()) {
                toast("You must add a community name",{
                    description:"A Community name is mandatory"
                })
             
              return;
            }
          
            if (!slug.trim()) {
                toast("You must add a slug",{
                    description:"A Slug is mandatory"
                })
              
              return;
            }

            startTransition(async () => {
                try {
                  let imageBase64: string | null = null;
                  let fileName: string | null = null;
                  let fileType: string | null = null;
              
                  if (imageFile) {
                    const reader = new FileReader();
                    imageBase64 = await new Promise<string>((resolve) => {
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
                  
                  if (result && "error" in result && result.error) {
                    setErrorMessage(result.error);
                  } else if (result && "subreddit" in result && result.subreddit && (result.subreddit as any)._id) {
                    setOpen(false);
                    resetForm();
                    router.push(`/community/${(result.subreddit as any)._id}`)
                  }
                  
                } catch (err) {
                  console.error("Failed to create community", err);
                  toast("Error occured while creating the community")
                 
                }

                
              });
          
            
          };
    
  return (
    
    <div>
        <Dialog  open={open} onOpenChange={setOpen}>
  <DialogTrigger
  className="w-full p-2 pl-12 flex items-center rounded-md cursor-pointer bg-black text-white hover:bg-black transition-all duration-200 disabled:text-sm disabled:opacity-50 disabled:cursor-not-allowed text-center"
  disabled={!user}
  >{!user ? "sign in to create Community":"Create Community +"}</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Create a Community!</DialogTitle>
      <DialogDescription>
       Create a communtiy/subreddit to share ideas and feedbacks.
      </DialogDescription>
      <form onSubmit={handleCreateCommunity} className="space-y-4 mt-2">
    {errorMessage && (
        <div className="text-red-500 text-sm">{errorMessage}</div>
    )}

    <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
            Community Name
        </label>
        <Input
            id="name"
            name="name"
            placeholder="My Community"
            className="w-full focus:ring-2 focus:ring-blue-500"
            value={name}
            onChange={handleNameChange}
            required
            minLength={3}
            maxLength={21}
        />
    </div>
    <div className="space-y-2">
    <label htmlFor="slug" className="text-sm font-medium">
        Community Slug (URL)
    </label>
    <Input
        id="slug"
        name="slug"
        placeholder="my-community"
        className="w-full focus:ring-2 focus:ring-blue-500"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        required
        minLength={3}
        maxLength={21}
        pattern="[a-z0-9\-]+"
        title="Lowercase letters, numbers, and hyphens only"
    />
    <p className="text-xs text-gray-500">
        This will be used in the URL: reddish.com/community/
        {slug || "community-slug"}
    </p>
</div>
<div className="space-y-2">
    <label htmlFor="description" className="text-sm font-medium">
        Description
    </label>
    <Textarea
        id="description"
        name="description"
        placeholder="What is this community about?"
        className="w-full focus:ring-2 focus:ring-blue-500"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
    />
</div>
<div className="relative w-24 h-24 mx-auto">
  {imagePreview ? (
    <>
      <Image
        src={imagePreview}
        alt="Community preview"
        fill
        className="object-cover rounded-full"
      />
      <button
        type="button"
        onClick={removeImage}
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center cursor-pointer"
      >
        ×
      </button>
      {imageSize && (
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 bg-white px-2 py-1 rounded">
          {imageSize}
        </div>
      )}
    </>
  ) : (
    <div className="flex items-center justify-center w-full">
      <label
        htmlFor="community-image"
        className="flex flex-col items-center justify-center w-150 h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 mt-3"
      >
        <div className="flex flex-col items-center justify-center w-100 ">
          <ImageIcon className="w-6 h-6 mb-2 text-gray-400" />
          <p className="text-xs text-gray-500">Click to upload an image</p>
          <p className="text-xs text-gray-400 mt-1">Max 5MB, will be compressed to ~500KB</p>
        </div>
        <input
          id="community-image"
          name="community-image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          ref={fileInputRef}
          className="hidden"
        />
      </label>
    </div>
  )}
</div>
<Button
  type="submit"
  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
  disabled={isPending || !user}
>
  {isPending
    ? "Creating..."
    : user
    ? "Create Community"
    : "Sign in to create community"}
</Button>
</form>
    </DialogHeader>
  </DialogContent>
</Dialog>
    </div>
  )
}

export default CreateCommunityButton