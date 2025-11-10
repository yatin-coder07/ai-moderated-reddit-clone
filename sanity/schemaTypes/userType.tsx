import {defineField, defineType} from "sanity";
import {UserIcon} from "lucide-react";
import Image from "next/image";

export const userType = defineType({
  name: "user",
  title: "User",
  type: "document",
  icon: UserIcon,
  fields: [
    defineField({
      name: "username",
      title: "Username",
      type: "string",
      validation: (rule) => rule.required(),
      description: "Unique username for the user"
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      validation: (rule) => rule.required().error("email is required"),
      description: "User's email address"
    }),
    defineField({
      name: "imageUrl",
      title: "Profile Image",
      type: "image",
     options:{
      hotspot:true
     },
      description: "user's profile image"
    }),
    defineField({
      name: "joinedAt",
      title: "Joined At",
      type: "datetime",
      validation: (rule) => rule.required(),
      description: "When the user joined the platform",
      initialValue: () => new Date().toISOString()
    }),
    defineField({
      name: "isReported",
      title: "Is Reported",
      type: "boolean",
      description: "Whether this user has been reported",
      initialValue: false
    })
  ],
  preview:{
    select:{
      title:"username",
      media:"imageUrl"
    },
    prepare({
      title ,media
    }){
      return{title,
        media:media?(
          <Image src={media} alt={`${title}'s avatar`} width={40} height={40}/>
        ) :(
          <UserIcon/>
        ),
      }
    }
  }
  
});
