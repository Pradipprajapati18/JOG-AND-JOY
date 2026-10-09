export const getImageUrl = (imagePath) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  
  // If no cloud name is configured, or if it's a logo/static asset, fallback to local images
  if (!cloudName || imagePath.toLowerCase().includes('logo')) {
    // Make sure we have a leading slash for local paths
    return imagePath.startsWith('/') ? `/images${imagePath}` : `/images/${imagePath}`;
  }

  // Remove leading slash if present for Cloudinary public ID
  const cleanPath = imagePath.replace(/^\//, '');
  
  // Use Cloudinary fetch URL with automatic format and quality optimization
  // Assuming images are uploaded to a 'jog-and-joy' folder in Cloudinary
  return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/jog-and-joy/${cleanPath}`;
};
