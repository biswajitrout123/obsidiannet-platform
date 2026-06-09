import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';


// 🚀 CRITICAL: Force-load environment variables inside this specific module 
// to prevent the ES Modules hoisting bug from bypassing your variables.
dotenv.config();

// Double-check initialization values
if (!process.env.CLOUDINARY_API_KEY) {
    console.warn("⚠️ Warning: CLOUDINARY_API_KEY is missing during Cloudinary initialization.");
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDNARY_CLOUD_NAME, // Handles both spellings as a safety fallback
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;