import { Router } from 'express';
import { body, query } from 'express-validator';
import {
  createReview,
  updateReview,
  deleteReview,
  getReview,
  getListingReviews,
  getUserReviews,
  replyToReview,
  getReviewStats,
} from '../controllers/review.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// Create review (guest after completed booking)
router.post(
  '/',
  authenticate,
  [
    body('bookingId').notEmpty().withMessage('شناسه رزرو الزامی است'),
    body('cleanliness')
      .isInt({ min: 1, max: 5 })
      .withMessage('امتیاز نظافت باید بین ۱ تا ۵ باشد'),
    body('accuracy')
      .isInt({ min: 1, max: 5 })
      .withMessage('امتیاز صحت اطلاعات باید بین ۱ تا ۵ باشد'),
    body('communication')
      .isInt({ min: 1, max: 5 })
      .withMessage('امتیاز ارتباط باید بین ۱ تا ۵ باشد'),
    body('location')
      .isInt({ min: 1, max: 5 })
      .withMessage('امتیاز موقعیت باید بین ۱ تا ۵ باشد'),
    body('checkIn')
      .isInt({ min: 1, max: 5 })
      .withMessage('امتیاز ورود باید بین ۱ تا ۵ باشد'),
    body('value')
      .isInt({ min: 1, max: 5 })
      .withMessage('امتیاز ارزش باید بین ۱ تا ۵ باشد'),
    body('comment')
      .notEmpty()
      .withMessage('نظر الزامی است')
      .isLength({ min: 20 })
      .withMessage('نظر باید حداقل ۲۰ کاراکتر باشد'),
  ],
  validate,
  createReview
);

// Update review (within 48 hours)
router.put(
  '/:id',
  authenticate,
  [
    body('comment')
      .optional()
      .isLength({ min: 20 })
      .withMessage('نظر باید حداقل ۲۰ کاراکتر باشد'),
  ],
  validate,
  updateReview
);

// Delete review (admin only)
router.delete('/:id', authenticate, authorize('ADMIN'), deleteReview);

// Get single review
router.get('/:id', getReview);

// Get listing reviews (public)
router.get(
  '/listing/:listingId',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('sortBy').optional().isIn(['newest', 'oldest', 'highest', 'lowest']),
  ],
  validate,
  getListingReviews
);

// Get user reviews
router.get(
  '/user/:userId',
  [
    query('type').optional().isIn(['given', 'received']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
  ],
  validate,
  getUserReviews
);

// Reply to review (host only)
router.post(
  '/:id/reply',
  authenticate,
  authorize('HOST'),
  [
    body('reply')
      .notEmpty()
      .withMessage('پاسخ الزامی است')
      .isLength({ min: 10 })
      .withMessage('پاسخ باید حداقل ۱۰ کاراکتر باشد'),
  ],
  validate,
  replyToReview
);

// Get review statistics for a listing
router.get('/stats/listing/:listingId', getReviewStats);

export default router;
