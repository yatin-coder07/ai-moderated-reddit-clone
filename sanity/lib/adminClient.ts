import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "../env";


export const adminClient = createClient({
    projectId,        // Sanity project ID
    dataset,          // Dataset name (usually 'production')
    apiVersion,       // API version date
    useCdn: true,     // Enable Content Delivery Network for faster reads
    token: process.env.SANITY_API_ADMIN_TOKEN, // Admin token for write operations
});