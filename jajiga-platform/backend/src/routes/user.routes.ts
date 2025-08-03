import { Router } from 'express';
import { body } from 'express-validator';
import {
  getProfile,
  updateProfile,
  changePassword,
  uploadAvatar,
  deleteAvatar,
  getFavorites,
  addFavorite,
  removeFavorite,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  becomeHost,
  getHostProfile,
} from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { upload } from '../middleware/upload';

const router = Router();

// Get current user profile
router.get('/profile', authenticate, getProfile);

// Update profile
router.put(
  '/profile',
  authenticate,
  [
    body('firstName').optional().notEmpty().withMessage('نام نمی‌تواند خالی باشد'),
    body('lastName').optional().notEmpty().withMessage('نام خانوادگی نمی‌تواند خالی باشد'),
    body('email').optional().isEmail().withMessage('ایمیل معتبر نیست'),
    body('nationalId')
      .optional()
      .matches(/^\d{10}$/)
      .withMessage('کد ملی باید ۱۰ رقم باشد'),
  ],
  validate,
  updateProfile
);

// Change password
router.put(
  '/change-password',
  authenticate,
  [
    body('currentPassword').notEmpty().withMessage('رمز عبور فعلی الزامی است'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('رمز عبور جدید باید حداقل ۶ کاراکتر باشد'),
  ],
  validate,
  changePassword
);

// Upload avatar
router.post(
  '/avatar',
  authenticate,
  upload.single('avatar'),
  uploadAvatar
);

// Delete avatar
router.delete('/avatar', authenticate, deleteAvatar);

// Get favorites
router.get('/favorites', authenticate, getFavorites);

// Add to favorites
router.post(
  '/favorites/:listingId',
  authenticate,
  addFavorite
);

// Remove from favorites
router.delete(
  '/favorites/:listingId',
  authenticate,
  removeFavorite
);

// Get notifications
router.get('/notifications', authenticate, getNotifications);

// Mark notification as read
router.put(
  '/notifications/:notificationId/read',
  authenticate,
  markNotificationAsRead
);

// Mark all notifications as read
router.put(
  '/notifications/read-all',
  authenticate,
  markAllNotificationsAsRead
);

// Become a host
router.post(
  '/become-host',
  authenticate,
  authorize('GUEST'),
  [
    body('description')
      .optional()
      .isLength({ min: 50 })
      .withMessage('توضیحات باید حداقل ۵۰ کاراکتر باشد'),
    body('bankAccountNumber')
      .notEmpty()
      .withMessage('شماره حساب بانکی الزامی است')
      .matches(/^\d{16}$/)
      .withMessage('شماره حساب باید ۱۶ رقم باشد'),
    body('bankAccountName')
      .notEmpty()
      .withMessage('نام صاحب حساب الزامی است'),
  ],
  validate,
  becomeHost
);

// Get host profile
router.get('/host/:userId', getHostProfile);

export default router;
