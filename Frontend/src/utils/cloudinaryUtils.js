import axios from 'axios';
import { API_BASE_URL } from '../api/api';

/**
 * Upload an image file to Cloudinary via backend API
 * @param {File} file - The image file to upload
 * @returns {Promise<string>} - The URL of the uploaded image
 */
export const uploadImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('Upload response:', response.data);

    if (response.data.success && response.data.data && response.data.data.url) {
      return response.data.data.url;
    } else {
      console.error('Invalid response structure:', response.data);
      throw new Error('Upload failed - invalid response structure');
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    console.error('Error details:', error.response?.data);
    throw error;
  }
};

/**
 * Upload multiple images to Cloudinary
 * @param {File[]} files - Array of image files to upload
 * @returns {Promise<string[]>} - Array of URLs of uploaded images
 */
export const uploadMultipleImages = async (files) => {
  try {
    const uploadPromises = files.map(file => uploadImage(file));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw error;
  }
};
