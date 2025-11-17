import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload buffer to Cloudinary
export const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'general',
        transformation: options.transformation || [
          { width: 1200, height: 800, crop: 'limit', quality: 'auto' }
        ],
        ...options
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height
          });
        }
      }
    );
    
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

// Upload thumbnail image
export const uploadThumbnail = async (buffer) => {
  return uploadToCloudinary(buffer, {
    folder: 'thumbnails',
    transformation: [
      { width: 600, height: 400, crop: 'fill', quality: 'auto' }
    ]
  });
};

// Upload tour images
export const uploadTourImages = async (buffers) => {
  const uploadPromises = buffers.map(buffer => 
    uploadToCloudinary(buffer, {
      folder: 'tours',
      transformation: [
        { width: 1200, height: 800, crop: 'limit', quality: 'auto' }
      ]
    })
  );
  
  return Promise.all(uploadPromises);
};

// Upload trek images
export const uploadTrekImages = async (buffers) => {
  const uploadPromises = buffers.map(buffer => 
    uploadToCloudinary(buffer, {
      folder: 'treks',
      transformation: [
        { width: 1200, height: 800, crop: 'limit', quality: 'auto' }
      ]
    })
  );
  
  return Promise.all(uploadPromises);
};

// Delete image from Cloudinary
export const deleteFromCloudinary = async (public_id) => {
  try {
    const result = await cloudinary.uploader.destroy(public_id);
    return result;
  } catch (error) {
    throw new Error(`Failed to delete image: ${error.message}`);
  }
};

// Generate image URL with transformations
export const getOptimizedImageUrl = (public_id, options = {}) => {
  return cloudinary.url(public_id, {
    transformation: [
      { width: options.width || 800, height: options.height || 600, crop: 'limit' },
      { quality: 'auto' },
      { fetch_format: 'auto' }
    ]
  });
};

export default cloudinary;