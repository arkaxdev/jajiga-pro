import { Router } from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  verifyOTP,
  resendOTP,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout,
} from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';

const router = Router();

// Register
router.post(
  '/register',
  [
    body('firstName').notEmpty().withMessage('نام الزامی است'),
    body('lastName').notEmpty().withMessage('نام خانوادگی الزامی است'),
    body('mobile')
      .notEmpty()
      .withMessage('شماره موبایل الزامی است')
      .matches(/^09\d{9}$/)
      .withMessage('شماره موبایل معتبر نیست'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('رمز عبور باید حداقل ۶ کاراکتر باشد'),
    body('role')
      .optional()
      .isIn(['GUEST', 'HOST'])
      .withMessage('نقش کاربری معتبر نیست'),
  ],
  validate,
  register
);

// Login
router.post(
  '/login',
  [
    body('mobile')
      .notEmpty()
      .withMessage('شماره موبایل الزامی است')
      .matches(/^09\d{9}$/)
      .withMessage('شماره موبایل معتبر نیست'),
    body('password').notEmpty().withMessage('رمز عبور الزامی است'),
  ],
  validate,
  login
);

// Verify OTP
router.post(
  '/verify-otp',
  [
    body('mobile')
      .notEmpty()
      .withMessage('شماره موبایل الزامی است')
      .matches(/^09\d{9}$/)
      .withMessage('شماره موبایل معتبر نیست'),
    body('code')
      .notEmpty()
      .withMessage('کد تأیید الزامی است')
      .isLength({ min: 6, max: 6 })
      .withMessage('کد تأیید باید ۶ رقم باشد'),
  ],
  validate,
  verifyOTP
);

// Resend OTP
router.post(
  '/resend-otp',
  [
    body('mobile')
      .notEmpty()
      .withMessage('شماره موبایل الزامی است')
      .matches(/^09\d{9}$/)
      .withMessage('شماره موبایل معتبر نیست'),
  ],
  validate,
  resendOTP
);

// Forgot Password
router.post(
  '/forgot-password',
  [
    body('mobile')
      .notEmpty()
      .withMessage('شماره موبایل الزامی است')
      .matches(/^09\d{9}$/)
      .withMessage('شماره موبایل معتبر نیست'),
  ],
  validate,
  forgotPassword
);

// Reset Password
router.post(
  '/reset-password',
  [
    body('mobile')
      .notEmpty()
      .withMessage('شماره موبایل الزامی است')
      .matches(/^09\d{9}$/)
      .withMessage('شماره موبایل معتبر نیست'),
    body('code')
      .notEmpty()
      .withMessage('کد تأیید الزامی است')
      .isLength({ min: 6, max: 6 })
      .withMessage('کد تأیید باید ۶ رقم باشد'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('رمز عبور جدید باید حداقل ۶ کاراکتر باشد'),
  ],
  validate,
  resetPassword
);

// Refresh Token
router.post(
  '/refresh-token',
  [
    body('refreshToken').notEmpty().withMessage('Refresh token الزامی است'),
  ],
  validate,
  refreshToken
);

// Logout
router.post('/logout', authenticate, logout);

export default router;
