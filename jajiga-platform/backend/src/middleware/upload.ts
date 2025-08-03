import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Cloudinary storage for different file types
const createCloudinaryStorage = (folder: string, allowedFormats: string[]) => {
  return new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
      const fileExt = path.extname(file.originalname).substring(1);
      return {
        folder: `jajiga/${folder}`,
        allowed_formats: allowedFormats,
        public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
        transformation: folder === 'avatars' 
          ? [{ width: 500, height: 500, crop: 'fill', gravity: 'face' }]
          : folder === 'listings'
          ? [{ width: 1200, height: 800, crop: 'limit', quality: 'auto' }]
          : undefined,
      };
    },
  });
};

// Local storage for development
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter
const fileFilter = (allowedMimeTypes: string[]) => {
  return (req: any, file: any, cb: any) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('فرمت فایل مجاز نیست'), false);
    }
  };
};

// Create multer instances for different purposes
const createMulterInstance = (
  folder: string,
  allowedFormats: string[],
  allowedMimeTypes: string[],
  maxSize: number
) => {
  const storage = process.env.NODE_ENV === 'production'
    ? createCloudinaryStorage(folder, allowedFormats)
    : localStorage;

  return multer({
    storage,
    limits: { fileSize: maxSize },
    fileFilter: fileFilter(allowedMimeTypes),
  });
};

// Avatar upload (single image)
export const uploadAvatar = createMulterInstance(
  'avatars',
  ['jpg', 'jpeg', 'png', 'webp'],
  ['image/jpeg', 'image/png', 'image/webp'],
  5 * 1024 * 1024 // 5MB
);

// Listing images upload (multiple images)
export const uploadListingImages = createMulterInstance(
  'listings',
  ['jpg', 'jpeg', 'png', 'webp'],
  ['image/jpeg', 'image/png', 'image/webp'],
  10 * 1024 * 1024 // 10MB
);

// Document upload (for verification)
export const uploadDocument = createMulterInstance(
  'documents',
  ['jpg', 'jpeg', 'png', 'pdf'],
  ['image/jpeg', 'image/png', 'application/pdf'],
  10 * 1024 * 1024 // 10MB
);

// Generic upload middleware
export const upload = multer({
  storage: process.env.NODE_ENV === 'production' ? undefined : localStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB default
});

// Helper function to delete file from Cloudinary
export const deleteFromCloudinary = async (publicId: string) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

// Helper function to get Cloudinary URL with transformation
export const getCloudinaryUrl = (publicId: string, options: any = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    ...options,
  });
};
