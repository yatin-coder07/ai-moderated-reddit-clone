"use server";

import { sanityFetch} from "../live";
import { defineQuery } from "groq";

import { currentUser } from "@clerk/nextjs/server";

import { addUser } from "./addUser";

interface UserResult {
   _id: string;
    username: string;
    imageUrl: string;
    email: string;
}
const parseUsername = (username: string) => {
    // Remove whitespace and convert to camelCase with random number to avoid conflicts
    const randomNum = Math.floor(1000 + Math.random() * 9000);

    // Convert whitespace to camelCase and add random number to avoid conflicts
    return username
        .replace(/\s+(.)/g, (_, char) => char.toUpperCase()) // Convert whitespace to camelCase
        .replace(/\s+/g, "") + randomNum; // Remove all whitespace and add random number
};
export async function getUser(): Promise<UserResult | { error: string }> {
    try {
        console.log("Getting current user from Clerk");
        const loggedInUser = await currentUser();
    
        if (!loggedInUser) {
            console.log("No user logged in");
            return { error: "User not found" };
        }
    
        console.log(`Found Clerk user: ${loggedInUser.id}`);
    
        // Check if user exists in the database first
        const getExistingUserQuery = defineQuery(
            '*[_type == "user" && _id == $id][0]'
        );
        //we giving the params as id is a dymanic value and different for every user
        const existingUser = await sanityFetch({
            query:getExistingUserQuery,
            params:{id:loggedInUser.id}
        })
       
        // If user exists, return the user data
if (existingUser.data?._id) {
    console.log(`User found in database with ID: ${existingUser.data._id}`);
    const user = {
        _id: existingUser.data._id,
        username: existingUser.data.username!,
        imageUrl: typeof existingUser.data.imageUrl === 'string' ? existingUser.data.imageUrl : '',
        email: existingUser.data.email!,
    };
    return user;
}
console.log("User not found in database, creating new user");
// If user doesn't exist, create a new user
const newUser = await addUser({
    id: loggedInUser.id,
    username: parseUsername(loggedInUser.fullName!),
    email:
    loggedInUser.primaryEmailAddress?.emailAddress ||
    loggedInUser.emailAddresses[0].emailAddress,
    imageUrl: loggedInUser.imageUrl,
});
const user = {
    _id:newUser._id,
    username:newUser.username!,
    imageUrl: typeof newUser.imageUrl === 'string' ? newUser.imageUrl : '',
    email:newUser.email,
}
return user;


    } catch (error) {
        console.error("Error in getUser:", error);
        return { error: "Failed to get user" };
    }
}