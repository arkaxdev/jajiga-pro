import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface UploadOptions {
  folder?: string;
  transformation?: any[];
  format?: string;
  public_id?: string;
}

export const uploadToCloudinary = (
  buffer: Buffer,
  options: UploadOptions = {}
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'jajiga',
        transformation: options.transformation,
        format: options.format || 'auto',
        public_id: options.public_id,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    const readableStream = Readable.from(buffer);
    readableStream.pipe(uploadStream);
  });
};

export const deleteFromCloudinary = async (publicId: string): Promise<any> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

export const uploadMultipleToCloudinary = async (
  files: Express.Multer.File[],
  options: UploadOptions = {}
): Promise<any[]> => {
  const uploadPromises = files.map((file) =>
    uploadToCloudinary(file.buffer, {
      ...options,
      public_id: `${options.folder}/${Date.now()}-${file.originalname}`,
    })
  );

  return Promise.all(uploadPromises);
};
