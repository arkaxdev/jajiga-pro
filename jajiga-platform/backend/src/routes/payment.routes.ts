import { Router } from 'express';
import { body, query } from 'express-validator';
import {
  initiatePayment,
  verifyPayment,
  getPaymentDetails,
  getMyPayments,
  getHostPayouts,
  requestPayout,
  getTransactions,
  refundPayment,
} from '../controllers/payment.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// Initiate payment for booking
router.post(
  '/initiate',
  authenticate,
  [
    body('bookingId').notEmpty().withMessage('شناسه رزرو الزامی است'),
    body('amount').isFloat({ min: 0 }).withMessage('مبلغ معتبر نیست'),
    body('paymentType')
      .notEmpty()
      .isIn(['DEPOSIT', 'FULL_PAYMENT'])
      .withMessage('نوع پرداخت معتبر نیست'),
  ],
  validate,
  initiatePayment
);

// Verify payment (callback from payment gateway)
router.get('/verify', verifyPayment);

// Get payment details
router.get('/:id', authenticate, getPaymentDetails);

// Get my payments (guest)
router.get(
  '/my/payments',
  authenticate,
  [
    query('status').optional().isIn(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
  ],
  validate,
  getMyPayments
);

// Get host payouts
router.get(
  '/host/payouts',
  authenticate,
  authorize('HOST'),
  [
    query('status').optional().isIn(['PENDING', 'PROCESSING', 'COMPLETED']),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
  ],
  validate,
  getHostPayouts
);

// Request payout (host)
router.post(
  '/host/request-payout',
  authenticate,
  authorize('HOST'),
  [
    body('amount').isFloat({ min: 50000 }).withMessage('حداقل مبلغ برداشت ۵۰,۰۰۰ تومان است'),
  ],
  validate,
  requestPayout
);

// Get transactions
router.get(
  '/transactions',
  authenticate,
  [
    query('type').optional().isIn(['PAYMENT', 'REFUND', 'PAYOUT', 'COMMISSION']),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
  ],
  validate,
  getTransactions
);

// Refund payment (admin or automatic based on cancellation policy)
router.post(
  '/:id/refund',
  authenticate,
  [
    body('amount').isFloat({ min: 0 }).withMessage('مبلغ بازپرداخت معتبر نیست'),
    body('reason').notEmpty().withMessage('دلیل بازپرداخت الزامی است'),
  ],
  validate,
  refundPayment
);

export default router;
