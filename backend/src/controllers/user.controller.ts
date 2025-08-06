import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { uploadToCloudinary } from '../services/cloudinary.service';

const prisma = new PrismaClient();

export const userController = {
  // Get current user profile
  getProfile: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          mobile: true,
          role: true,
          avatar: true,
          nationalId: true,
          isVerified: true,
          createdAt: true,
        },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'کاربر یافت نشد',
        });
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت اطلاعات کاربر',
      });
    }
  },

  // Update user profile
  updateProfile: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const { firstName, lastName, email, nationalId } = req.body;

      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          firstName,
          lastName,
          email,
          nationalId,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          mobile: true,
          role: true,
          avatar: true,
          nationalId: true,
          isVerified: true,
        },
      });

      res.json({
        success: true,
        message: 'پروفایل با موفقیت بروزرسانی شد',
        data: user,
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در بروزرسانی پروفایل',
      });
    }
  },

  // Update avatar
  updateAvatar: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'فایل تصویر ارسال نشده است',
        });
      }

      // Upload to cloudinary
      const result = await uploadToCloudinary(file.buffer, {
        folder: 'avatars',
        transformation: [
          { width: 300, height: 300, crop: 'fill' },
        ],
      });

      // Update user avatar
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          avatar: result.secure_url,
        },
        select: {
          id: true,
          avatar: true,
        },
      });

      res.json({
        success: true,
        message: 'تصویر پروفایل با موفقیت بروزرسانی شد',
        data: user,
      });
    } catch (error) {
      console.error('Update avatar error:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در بروزرسانی تصویر پروفایل',
      });
    }
  },

  // Change password
  changePassword: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const { currentPassword, newPassword } = req.body;

      // Get user with password
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'کاربر یافت نشد',
        });
      }

      // Check current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          message: 'رمز عبور فعلی صحیح نیست',
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: {
          password: hashedPassword,
        },
      });

      res.json({
        success: true,
        message: 'رمز عبور با موفقیت تغییر یافت',
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در تغییر رمز عبور',
      });
    }
  },

  // Become a host
  becomeHost: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const { nationalId, bankAccountNumber, bankAccountName } = req.body;

      // Check if user is already a host
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (user?.role === 'HOST') {
        return res.status(400).json({
          success: false,
          message: 'شما قبلاً میزبان هستید',
        });
      }

      // Update user role and info
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          role: 'HOST',
          nationalId,
          bankAccountNumber,
          bankAccountName,
        },
        select: {
          id: true,
          role: true,
        },
      });

      res.json({
        success: true,
        message: 'تبریک! شما اکنون میزبان هستید',
        data: updatedUser,
      });
    } catch (error) {
      console.error('Become host error:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در تبدیل به میزبان',
      });
    }
  },

  // Get user favorites
  getFavorites: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const { page = 1, limit = 10 } = req.query;
      
      const skip = (Number(page) - 1) * Number(limit);

      const [favorites, total] = await Promise.all([
        prisma.favorite.findMany({
          where: { userId },
          include: {
            listing: {
              include: {
                images: true,
                host: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatar: true,
                  },
                },
              },
            },
          },
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
        }),
        prisma.favorite.count({
          where: { userId },
        }),
      ]);

      res.json({
        success: true,
        data: {
          items: favorites.map(f => f.listing),
          total,
          page: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      console.error('Get favorites error:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت علاقه‌مندی‌ها',
      });
    }
  },

  // Toggle favorite
  toggleFavorite: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const { listingId } = req.params;

      // Check if favorite exists
      const existingFavorite = await prisma.favorite.findUnique({
        where: {
          userId_listingId: {
            userId,
            listingId,
          },
        },
      });

      if (existingFavorite) {
        // Remove favorite
        await prisma.favorite.delete({
          where: {
            userId_listingId: {
              userId,
              listingId,
            },
          },
        });

        res.json({
          success: true,
          message: 'از علاقه‌مندی‌ها حذف شد',
          data: { isFavorite: false },
        });
      } else {
        // Add favorite
        await prisma.favorite.create({
          data: {
            userId,
            listingId,
          },
        });

        res.json({
          success: true,
          message: 'به علاقه‌مندی‌ها اضافه شد',
          data: { isFavorite: true },
        });
      }
    } catch (error) {
      console.error('Toggle favorite error:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در مدیریت علاقه‌مندی',
      });
    }
  },
};
