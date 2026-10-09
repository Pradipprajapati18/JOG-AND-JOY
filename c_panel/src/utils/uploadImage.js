/**
 * Uploads a file to Cloudinary using an unsigned upload preset.
 * 
 * @param {File} file - The file object from an input element.
 * @returns {Promise<string>} - The secure URL of the uploaded image.
 */
export async function uploadToCloudinary(file) {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary credentials missing. Please check your .env file.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to upload image to Cloudinary');
    }

    const data = await response.json();
    return data.secure_url; // E.g. https://res.cloudinary.com/...
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
}
