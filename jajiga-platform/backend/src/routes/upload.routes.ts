import { Router } from 'express';
import {
  uploadSingleImage,
  uploadMultipleImages,
  uploadDocument,
  deleteFile,
} from '../controllers/upload.controller';
import { authenticate } from '../middleware/auth';
import {
  uploadAvatar,
  uploadListingImages,
  uploadDocument as uploadDoc,
} from '../middleware/upload';

const router = Router();

// Upload single image (avatar)
router.post(
  '/avatar',
  authenticate,
  uploadAvatar.single('image'),
  uploadSingleImage
);

// Upload multiple images (listing)
router.post(
  '/listing-images',
  authenticate,
  uploadListingImages.array('images', 20),
  uploadMultipleImages
);

// Upload document (verification)
router.post(
  '/document',
  authenticate,
  uploadDoc.single('document'),
  uploadDocument
);

// Delete uploaded file
router.delete('/:publicId', authenticate, deleteFile);

export default router;
