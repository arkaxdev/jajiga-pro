import { Router } from 'express';
import { body, query } from 'express-validator';
import {
  createListing,
  updateListing,
  deleteListing,
  getListing,
  getListings,
  searchListings,
  getMyListings,
  toggleListingStatus,
  uploadListingImages,
  deleteListingImage,
  reorderListingImages,
  updateAvailability,
  getAvailability,
  getListingReviews,
  getListingStats,
} from '../controllers/listing.controller';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { uploadListingImages as uploadImages } from '../middleware/upload';

const router = Router();

// Search listings (public)
router.get(
  '/search',
  optionalAuth,
  [
    query('city').optional().notEmpty().withMessage('شهر نمی‌تواند خالی باشد'),
    query('checkIn').optional().isISO8601().withMessage('تاریخ ورود معتبر نیست'),
    query('checkOut').optional().isISO8601().withMessage('تاریخ خروج معتبر نیست'),
    query('guests').optional().isInt({ min: 1 }).withMessage('تعداد مهمان باید حداقل ۱ باشد'),
    query('minPrice').optional().isFloat({ min: 0 }).withMessage('حداقل قیمت معتبر نیست'),
    query('maxPrice').optional().isFloat({ min: 0 }).withMessage('حداکثر قیمت معتبر نیست'),
    query('type').optional().isIn(['VILLA', 'APARTMENT', 'COTTAGE', 'ECOTOURISM', 'TRADITIONAL', 'SUITE']),
    query('amenities').optional().isArray(),
    query('instantBooking').optional().isBoolean(),
    query('page').optional().isInt({ min: 1 }).withMessage('شماره صفحه معتبر نیست'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('تعداد نتایج معتبر نیست'),
    query('sortBy').optional().isIn(['price_asc', 'price_desc', 'rating', 'newest']),
  ],
  validate,
  searchListings
);

// Get all listings (public)
router.get('/', optionalAuth, getListings);

// Get single listing (public)
router.get('/:id', optionalAuth, getListing);

// Get listing reviews (public)
router.get('/:id/reviews', getListingReviews);

// Get listing availability (public)
router.get(
  '/:id/availability',
  [
    query('startDate').isISO8601().withMessage('تاریخ شروع معتبر نیست'),
    query('endDate').isISO8601().withMessage('تاریخ پایان معتبر نیست'),
  ],
  validate,
  getAvailability
);

// Create listing (host only)
router.post(
  '/',
  authenticate,
  authorize('HOST'),
  [
    body('title')
      .notEmpty().withMessage('عنوان الزامی است')
      .isLength({ min: 10, max: 100 }).withMessage('عنوان باید بین ۱۰ تا ۱۰۰ کاراکتر باشد'),
    body('description')
      .notEmpty().withMessage('توضیحات الزامی است')
      .isLength({ min: 100 }).withMessage('توضیحات باید حداقل ۱۰۰ کاراکتر باشد'),
    body('type')
      .notEmpty().withMessage('نوع اقامتگاه الزامی است')
      .isIn(['VILLA', 'APARTMENT', 'COTTAGE', 'ECOTOURISM', 'TRADITIONAL', 'SUITE']),
    body('province').notEmpty().withMessage('استان الزامی است'),
    body('city').notEmpty().withMessage('شهر الزامی است'),
    body('address').notEmpty().withMessage('آدرس الزامی است'),
    body('latitude').isFloat({ min: -90, max: 90 }).withMessage('عرض جغرافیایی معتبر نیست'),
    body('longitude').isFloat({ min: -180, max: 180 }).withMessage('طول جغرافیایی معتبر نیست'),
    body('area').isInt({ min: 1 }).withMessage('متراژ باید عدد مثبت باشد'),
    body('maxGuests').isInt({ min: 1 }).withMessage('حداکثر تعداد مهمان باید حداقل ۱ باشد'),
    body('bedrooms').isInt({ min: 0 }).withMessage('تعداد اتاق خواب معتبر نیست'),
    body('beds').isInt({ min: 1 }).withMessage('تعداد تخت باید حداقل ۱ باشد'),
    body('bathrooms').isInt({ min: 1 }).withMessage('تعداد سرویس بهداشتی باید حداقل ۱ باشد'),
    body('pricePerNight').isFloat({ min: 0 }).withMessage('قیمت هر شب باید عدد مثبت باشد'),
    body('extraGuestFee').optional().isFloat({ min: 0 }).withMessage('هزینه نفر اضافه معتبر نیست'),
    body('checkInTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('ساعت ورود معتبر نیست'),
    body('checkOutTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('ساعت خروج معتبر نیست'),
    body('minStay').optional().isInt({ min: 1 }).withMessage('حداقل اقامت باید حداقل ۱ شب باشد'),
    body('maxStay').optional().isInt({ min: 1 }).withMessage('حداکثر اقامت معتبر نیست'),
    body('instantBooking').optional().isBoolean(),
    body('amenities').optional().isArray(),
    body('rules').optional().isArray(),
  ],
  validate,
  createListing
);

// Update listing (host only)
router.put(
  '/:id',
  authenticate,
  authorize('HOST'),
  [
    body('title')
      .optional()
      .isLength({ min: 10, max: 100 }).withMessage('عنوان باید بین ۱۰ تا ۱۰۰ کاراکتر باشد'),
    body('description')
      .optional()
      .isLength({ min: 100 }).withMessage('توضیحات باید حداقل ۱۰۰ کاراکتر باشد'),
    body('pricePerNight').optional().isFloat({ min: 0 }).withMessage('قیمت هر شب باید عدد مثبت باشد'),
    // Add other optional fields as needed
  ],
  validate,
  updateListing
);

// Delete listing (host only)
router.delete('/:id', authenticate, authorize('HOST'), deleteListing);

// Get my listings (host only)
router.get('/my/listings', authenticate, authorize('HOST'), getMyListings);

// Toggle listing status (host only)
router.patch(
  '/:id/status',
  authenticate,
  authorize('HOST'),
  [
    body('status')
      .notEmpty()
      .isIn(['ACTIVE', 'INACTIVE'])
      .withMessage('وضعیت معتبر نیست'),
  ],
  validate,
  toggleListingStatus
);

// Upload listing images (host only)
router.post(
  '/:id/images',
  authenticate,
  authorize('HOST'),
  uploadImages.array('images', 20),
  uploadListingImages
);

// Delete listing image (host only)
router.delete(
  '/:id/images/:imageId',
  authenticate,
  authorize('HOST'),
  deleteListingImage
);

// Reorder listing images (host only)
router.put(
  '/:id/images/reorder',
  authenticate,
  authorize('HOST'),
  [
    body('imageIds').isArray().withMessage('لیست تصاویر الزامی است'),
    body('imageIds.*').isString().withMessage('شناسه تصویر معتبر نیست'),
  ],
  validate,
  reorderListingImages
);

// Update availability (host only)
router.put(
  '/:id/availability',
  authenticate,
  authorize('HOST'),
  [
    body('dates').isArray().withMessage('لیست تاریخ‌ها الزامی است'),
    body('dates.*.date').isISO8601().withMessage('تاریخ معتبر نیست'),
    body('dates.*.isAvailable').isBoolean().withMessage('وضعیت دسترسی معتبر نیست'),
    body('dates.*.price').optional().isFloat({ min: 0 }).withMessage('قیمت معتبر نیست'),
  ],
  validate,
  updateAvailability
);

// Get listing stats (host only)
router.get('/:id/stats', authenticate, authorize('HOST'), getListingStats);

export default router;
