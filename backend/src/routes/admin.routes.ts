import { Router } from 'express';
import { body, query } from 'express-validator';
import {
  getDashboardStats,
  getUsers,
  getUserDetails,
  updateUserStatus,
  getListings,
  getListingDetails,
  updateListingStatus,
  getBookings,
  getPayments,
  getReports,
  getSystemSettings,
  updateSystemSettings,
  sendNotification,
  getAuditLogs,
} from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// All routes require admin authentication
router.use(authenticate, authorize('ADMIN'));

// Dashboard statistics
router.get('/dashboard', getDashboardStats);

// User management
router.get(
  '/users',
  [
    query('role').optional().isIn(['GUEST', 'HOST', 'ADMIN']),
    query('status').optional().isIn(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION']),
    query('search').optional().isString(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  getUsers
);

router.get('/users/:id', getUserDetails);

router.patch(
  '/users/:id/status',
  [
    body('status')
      .notEmpty()
      .isIn(['ACTIVE', 'INACTIVE', 'SUSPENDED'])
      .withMessage('وضعیت معتبر نیست'),
    body('reason').optional().isString(),
  ],
  validate,
  updateUserStatus
);

// Listing management
router.get(
  '/listings',
  [
    query('status').optional().isIn(['DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'INACTIVE', 'REJECTED']),
    query('type').optional().isIn(['VILLA', 'APARTMENT', 'COTTAGE', 'ECOTOURISM', 'TRADITIONAL', 'SUITE']),
    query('search').optional().isString(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  getListings
);

router.get('/listings/:id', getListingDetails);

router.patch(
  '/listings/:id/status',
  [
    body('status')
      .notEmpty()
      .isIn(['ACTIVE', 'INACTIVE', 'REJECTED'])
      .withMessage('وضعیت معتبر نیست'),
    body('reason').optional().isString(),
  ],
  validate,
  updateListingStatus
);

// Booking management
router.get(
  '/bookings',
  [
    query('status').optional().isIn(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'REJECTED']),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  getBookings
);

// Payment management
router.get(
  '/payments',
  [
    query('status').optional().isIn(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED']),
    query('method').optional().isIn(['ZARINPAL', 'CREDIT_CARD', 'BANK_TRANSFER']),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  getPayments
);

// Reports
router.get(
  '/reports',
  [
    query('type')
      .notEmpty()
      .isIn(['revenue', 'bookings', 'users', 'listings'])
      .withMessage('نوع گزارش معتبر نیست'),
    query('startDate').isISO8601().withMessage('تاریخ شروع معتبر نیست'),
    query('endDate').isISO8601().withMessage('تاریخ پایان معتبر نیست'),
    query('groupBy').optional().isIn(['day', 'week', 'month']),
  ],
  validate,
  getReports
);

// System settings
router.get('/settings', getSystemSettings);

router.put(
  '/settings',
  [
    body('key').notEmpty().withMessage('کلید تنظیمات الزامی است'),
    body('value').notEmpty().withMessage('مقدار تنظیمات الزامی است'),
  ],
  validate,
  updateSystemSettings
);

// Send notification
router.post(
  '/notifications/send',
  [
    body('userIds').optional().isArray(),
    body('userIds.*').optional().isString(),
    body('type')
      .notEmpty()
      .isIn(['all', 'hosts', 'guests', 'specific'])
      .withMessage('نوع ارسال معتبر نیست'),
    body('title').notEmpty().withMessage('عنوان پیام الزامی است'),
    body('message').notEmpty().withMessage('متن پیام الزامی است'),
  ],
  validate,
  sendNotification
);

// Audit logs
router.get(
  '/audit-logs',
  [
    query('userId').optional().isString(),
    query('action').optional().isString(),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  getAuditLogs
);

export default router;
