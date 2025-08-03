import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { sendSMS } from '../services/sms.service';
import { generateOTP, verifyOTPCode } from '../utils/otp';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// Generate JWT Token
const generateToken = (id: string, role: string): string => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Generate Refresh Token
const generateRefreshToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  });
};

// Register
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { firstName, lastName, mobile, password, role = 'GUEST' } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { mobile },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'این شماره موبایل قبلاً ثبت شده است',
        },
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        mobile,
        password: hashedPassword,
        role,
        verificationCode: otp,
        verificationExpiry: otpExpiry,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        mobile: true,
        role: true,
      },
    });

    // Send OTP via SMS
    await sendSMS(mobile, `کد تأیید جاجیگا: ${otp}`);

    logger.info(`New user registered: ${user.id}`);

    res.status(201).json({
      success: true,
      data: {
        user,
        message: 'کد تأیید به شماره موبایل شما ارسال شد',
      },
    });
  } catch (error) {
    logger.error('Registration error:', error);
    next(error);
  }
};

// Login
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { mobile, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { mobile },
      include: {
        hostProfile: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'شماره موبایل یا رمز عبور اشتباه است',
        },
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'شماره موبایل یا رمز عبور اشتباه است',
        },
      });
    }

    // Check if user is verified
    if (!user.isVerified) {
      // Generate new OTP
      const otp = generateOTP();
      const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          verificationCode: otp,
          verificationExpiry: otpExpiry,
        },
      });

      // Send OTP
      await sendSMS(mobile, `کد تأیید جاجیگا: ${otp}`);

      return res.status(403).json({
        success: false,
        error: {
          message: 'حساب کاربری شما تأیید نشده است. کد تأیید ارسال شد.',
          requiresVerification: true,
        },
      });
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        error: {
          message: 'حساب کاربری شما غیرفعال است',
        },
      });
    }

    // Generate tokens
    const token = generateToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    logger.info(`User logged in: ${user.id}`);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          mobile: user.mobile,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          isHost: !!user.hostProfile,
        },
        token,
        refreshToken,
      },
    });
  } catch (error) {
    logger.error('Login error:', error);
    next(error);
  }
};

// Verify OTP
export const verifyOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { mobile, code } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { mobile },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'کاربری با این شماره موبایل یافت نشد',
        },
      });
    }

    // Verify OTP
    const isValid = verifyOTPCode(
      code,
      user.verificationCode || '',
      user.verificationExpiry || new Date()
    );

    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'کد تأیید نامعتبر یا منقضی شده است',
        },
      });
    }

    // Update user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        status: 'ACTIVE',
        verificationCode: null,
        verificationExpiry: null,
      },
    });

    // Generate tokens
    const token = generateToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    logger.info(`User verified: ${user.id}`);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          mobile: user.mobile,
          role: user.role,
        },
        token,
        refreshToken,
      },
    });
  } catch (error) {
    logger.error('OTP verification error:', error);
    next(error);
  }
};

// Resend OTP
export const resendOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { mobile } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { mobile },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'کاربری با این شماره موبایل یافت نشد',
        },
      });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'این حساب کاربری قبلاً تأیید شده است',
        },
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationCode: otp,
        verificationExpiry: otpExpiry,
      },
    });

    // Send OTP
    await sendSMS(mobile, `کد تأیید جاجیگا: ${otp}`);

    logger.info(`OTP resent for user: ${user.id}`);

    res.json({
      success: true,
      data: {
        message: 'کد تأیید جدید ارسال شد',
      },
    });
  } catch (error) {
    logger.error('Resend OTP error:', error);
    next(error);
  }
};

// Forgot Password
export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { mobile } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { mobile },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'کاربری با این شماره موبایل یافت نشد',
        },
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationCode: otp,
        verificationExpiry: otpExpiry,
      },
    });

    // Send OTP
    await sendSMS(mobile, `کد بازیابی رمز عبور جاجیگا: ${otp}`);

    logger.info(`Password reset OTP sent for user: ${user.id}`);

    res.json({
      success: true,
      data: {
        message: 'کد بازیابی رمز عبور ارسال شد',
      },
    });
  } catch (error) {
    logger.error('Forgot password error:', error);
    next(error);
  }
};

// Reset Password
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { mobile, code, newPassword } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { mobile },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'کاربری با این شماره موبایل یافت نشد',
        },
      });
    }

    // Verify OTP
    const isValid = verifyOTPCode(
      code,
      user.verificationCode || '',
      user.verificationExpiry || new Date()
    );

    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'کد بازیابی نامعتبر یا منقضی شده است',
        },
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        verificationCode: null,
        verificationExpiry: null,
      },
    });

    logger.info(`Password reset for user: ${user.id}`);

    res.json({
      success: true,
      data: {
        message: 'رمز عبور با موفقیت تغییر یافت',
      },
    });
  } catch (error) {
    logger.error('Reset password error:', error);
    next(error);
  }
};

// Refresh Token
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refreshToken } = req.body;

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET as string
    ) as { id: string };

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: decoded.id, status: 'ACTIVE' },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid refresh token',
        },
      });
    }

    // Generate new tokens
    const newToken = generateToken(user.id, user.role);
    const newRefreshToken = generateRefreshToken(user.id);

    res.json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    logger.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      error: {
        message: 'Invalid refresh token',
      },
    });
  }
};

// Logout
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // In a real application, you might want to blacklist the token
    // or remove it from a token store

    res.json({
      success: true,
      data: {
        message: 'با موفقیت خارج شدید',
      },
    });
  } catch (error) {
    logger.error('Logout error:', error);
    next(error);
  }
};
