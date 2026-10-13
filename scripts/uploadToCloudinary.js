import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

if (!process.env.CLOUDINARY_URL) {
  console.error("Error: CLOUDINARY_URL is missing in .env.local.");
  console.error("Please add it in this format: CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>");
  process.exit(1);
}

// We will also use VITE_CLOUDINARY_CLOUD_NAME in the frontend, so verify it's set
if (!process.env.VITE_CLOUDINARY_CLOUD_NAME) {
  console.warn("Warning: VITE_CLOUDINARY_CLOUD_NAME is missing in .env.local.");
  console.warn("You will need this for the getImageUrl.js utility to work on the frontend.");
}

const imagesDir = path.resolve(__dirname, '../public/images');

const uploadImages = async () => {
  try {
    const files = fs.readdirSync(imagesDir);
    
    console.log(`Found ${files.length} items in public/images. Starting upload...`);
    
    for (const file of files) {
      const filePath = path.join(imagesDir, file);
      
      const stat = fs.statSync(filePath);
      if (stat.isFile()) {
        console.log(`Uploading ${file}...`);
        try {
          const result = await cloudinary.uploader.upload(filePath, {
            folder: 'jog-and-joy',
            public_id: file, // This keeps the original filename
            use_filename: true,
            unique_filename: false,
            overwrite: true,
          });
          console.log(`✅ Uploaded: ${result.secure_url}`);
        } catch (uploadError) {
          console.error(`❌ Failed to upload ${file}:`, uploadError.message);
        }
      }
    }
    console.log('\nAll uploads finished!');
  } catch (err) {
    console.error("Error reading images directory:", err);
  }
};

uploadImages();
