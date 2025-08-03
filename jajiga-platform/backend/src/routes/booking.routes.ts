import { Router } from 'express';
import { body, query } from 'express-validator';
import {
  createBooking,
  getBooking,
  getMyBookings,
  getHostBookings,
  updateBookingStatus,
  cancelBooking,
  getBookingMessages,
  sendBookingMessage,
  checkAvailability,
  calculatePrice,
} from '../controllers/booking.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// Check availability before booking
router.post(
  '/check-availability',
  authenticate,
  [
    body('listingId').notEmpty().withMessage('شناسه اقامتگاه الزامی است'),
    body('checkIn').isISO8601().withMessage('تاریخ ورود معتبر نیست'),
    body('checkOut').isISO8601().withMessage('تاریخ خروج معتبر نیست'),
    body('guestCount').isInt({ min: 1 }).withMessage('تعداد مهمان باید حداقل ۱ باشد'),
  ],
  validate,
  checkAvailability
);

// Calculate price
router.post(
  '/calculate-price',
  authenticate,
  [
    body('listingId').notEmpty().withMessage('شناسه اقامتگاه الزامی است'),
    body('checkIn').isISO8601().withMessage('تاریخ ورود معتبر نیست'),
    body('checkOut').isISO8601().withMessage('تاریخ خروج معتبر نیست'),
    body('guestCount').isInt({ min: 1 }).withMessage('تعداد مهمان باید حداقل ۱ باشد'),
  ],
  validate,
  calculatePrice
);

// Create booking (guest)
router.post(
  '/',
  authenticate,
  [
    body('listingId').notEmpty().withMessage('شناسه اقامتگاه الزامی است'),
    body('checkIn').isISO8601().withMessage('تاریخ ورود معتبر نیست'),
    body('checkOut').isISO8601().withMessage('تاریخ خروج معتبر نیست'),
    body('guestCount').isInt({ min: 1 }).withMessage('تعداد مهمان باید حداقل ۱ باشد'),
    body('guestName').notEmpty().withMessage('نام مهمان الزامی است'),
    body('guestMobile')
      .notEmpty().withMessage('شماره موبایل مهمان الزامی است')
      .matches(/^09\d{9}$/).withMessage('شماره موبایل معتبر نیست'),
    body('guestEmail').optional().isEmail().withMessage('ایمیل معتبر نیست'),
    body('specialRequests').optional().isString(),
  ],
  validate,
  createBooking
);

// Get single booking
router.get('/:id', authenticate, getBooking);

// Get my bookings (guest)
router.get(
  '/my/bookings',
  authenticate,
  [
    query('status').optional().isIn(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'REJECTED']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
  ],
  validate,
  getMyBookings
);

// Get host bookings
router.get(
  '/host/bookings',
  authenticate,
  authorize('HOST'),
  [
    query('listingId').optional().isString(),
    query('status').optional().isIn(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'REJECTED']),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
  ],
  validate,
  getHostBookings
);

// Update booking status (host)
router.patch(
  '/:id/status',
  authenticate,
  authorize('HOST'),
  [
    body('status')
      .notEmpty()
      .isIn(['CONFIRMED', 'REJECTED'])
      .withMessage('وضعیت معتبر نیست'),
    body('reason').optional().isString(),
  ],
  validate,
  updateBookingStatus
);

// Cancel booking
router.post(
  '/:id/cancel',
  authenticate,
  [
    body('reason').notEmpty().withMessage('دلیل لغو الزامی است'),
  ],
  validate,
  cancelBooking
);

// Get booking messages
router.get('/:id/messages', authenticate, getBookingMessages);

// Send message for booking
router.post(
  '/:id/messages',
  authenticate,
  [
    body('content').notEmpty().withMessage('متن پیام الزامی است'),
  ],
  validate,
  sendBookingMessage
);

export default router;
