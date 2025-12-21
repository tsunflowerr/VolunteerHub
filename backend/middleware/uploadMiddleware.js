import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'volunteer-hub',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    // Removed synchronous transformation to speed up upload
  },
});

const upload = multer({ storage: storage });

// Named export for multiple file upload (max 10 images)
export const uploadMultiple = upload.array('image', 10);

// Named export for single file upload
export const uploadSingle = upload.single('image');

export default upload;
