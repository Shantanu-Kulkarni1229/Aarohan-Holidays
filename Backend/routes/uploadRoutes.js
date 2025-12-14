import express from 'express';
import { uploadSingle } from '../middlewares/uploadMiddleware.js';
import { uploadToCloudinary } from '../utils/cloudinaryUtils.js';

const router = express.Router();

// Upload single image
router.post('/', uploadSingle, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'aarohan-holidays',
      resource_type: 'image'
    });

    return res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: result.url,
        publicId: result.public_id
      }
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: error.message
    });
  }
});

export default router;
