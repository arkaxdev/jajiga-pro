import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { uploadMultipleToCloudinary, deleteFromCloudinary } from '../services/cloudinary.service';

const prisma = new PrismaClient();

export const listingController = {
  // Create new listing
  create: async (req: Request, res: Response) => {
    try {
      const hostId = req.user?.id;
      const files = req.files as Express.Multer.File[];
      
      // Upload images to cloudinary
      let imageUrls: string[] = [];
      if (files && files.length > 0) {
        const uploadResults = await uploadMultipleToCloudinary(files, {
          folder: 'listings',
          transformation: [
            { width: 1200, height: 800, crop: 'limit' },
          ],
        });
        imageUrls = uploadResults.map(result => result.secure_url);
      }

      // Create listing
      const listing = await prisma.listing.create({
        data: {
          ...req.body,
          hostId,
          latitude: parseFloat(req.body.latitude),
          longitude: parseFloat(req.body.longitude),
          pricePerNight: parseInt(req.body.pricePerNight),
          extraGuestFee: parseInt(req.body.extraGuestFee) || 0,
          weekendExtraCharge: parseInt(req.body.weekendExtraCharge) || 0,
          area: parseInt(req.body.area),
          maxGuests: parseInt(req.body.maxGuests),
          bedrooms: parseInt(req.body.bedrooms),
          beds: parseInt(req.body.beds),
          bathrooms: parseInt(req.body.bathrooms),
          amenities: req.body.amenities || [],
          rules: req.body.rules || [],
          images: {
            create: imageUrls.map((url, index) => ({
              url,
              order: index,
            })),
          },
        },
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
      });

      res.status(201).json({
        success: true,
        message: 'اقامتگاه با موفقیت ثبت شد',
        data: listing,
      });
    } catch (error) {
      console.error('Create listing error:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در ثبت اقامتگاه',
      });
    }
  },

  // Get all listings with filters
  getAll: async (req: Request, res: Response) => {
    try {
      const {
        page = 1,
        limit = 12,
        city,
        province,
        type,
        minPrice,
        maxPrice,
        guests,
        amenities,
        checkIn,
        checkOut,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      // Build where clause
      const where: any = {
        status: 'ACTIVE',
      };

      if (city) where.city = { contains: city as string, mode: 'insensitive' };
      if (province) where.province = { contains: province as string, mode: 'insensitive' };
      if (type) where.type = type;
      if (minPrice || maxPrice) {
        where.pricePerNight = {};
        if (minPrice) where.pricePerNight.gte = Number(minPrice);
        if (maxPrice) where.pricePerNight.lte = Number(maxPrice);
      }
      if (guests) where.maxGuests = { gte: Number(guests) };
      if (amenities) {
        const amenityList = (amenities as string).split(',');
        where.amenities = { hasEvery: amenityList };
      }

      // Get listings
      const [listings, total] = await Promise.all([
        prisma.listing.findMany({
          where,
          include: {
            images: {
              orderBy: { order: 'asc' },
              take: 1,
            },
            host: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
            reviews: {
              select: {
                rating: true,
              },
            },
            _count: {
              select: {
                reviews: true,
              },
            },
          },
          skip,
          take: Number(limit),
          orderBy: {
            [sortBy as string]: sortOrder,
          },
        }),
        prisma.listing.count({ where }),
      ]);

      // Calculate average ratings
      const listingsWithRating = listings.map(listing => {
        const avgRating = listing.reviews.length > 0
          ? listing.reviews.reduce((sum, review) => sum + review.rating, 0) / listing.reviews.length
          : 0;
        
        return {
          ...listing,
          averageRating: avgRating,
          reviewCount: listing._count.reviews,
        };
      });

      res.json({
        success: true,
        data: {
          items: listingsWithRating,
          total,
          page: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      console.error('Get listings error:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت اقامتگاه‌ها',
      });
    }
  },

  // Get single listing
  getById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const listing = await prisma.listing.findUnique({
        where: { id },
        include: {
          images: {
            orderBy: { order: 'asc' },
          },
          host: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
              createdAt: true,
              _count: {
                select: {
                  listings: true,
                },
              },
            },
          },
          reviews: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          _count: {
            select: {
              reviews: true,
              bookings: {
                where: {
                  status: 'COMPLETED',
                },
              },
            },
          },
        },
      });

      if (!listing) {
        return res.status(404).json({
          success: false,
          message: 'اقامتگاه یافت نشد',
        });
      }

      // Check if user has favorited this listing
      let isFavorite = false;
      if (userId) {
        const favorite = await prisma.favorite.findUnique({
          where: {
            userId_listingId: {
              userId,
              listingId: id,
            },
          },
        });
        isFavorite = !!favorite;
      }

      // Calculate average rating
      const avgRating = listing.reviews.length > 0
        ? listing.reviews.reduce((sum, review) => sum + review.rating, 0) / listing.reviews.length
        : 0;

      res.json({
        success: true,
        data: {
          ...listing,
          averageRating: avgRating,
          reviewCount: listing._count.reviews,
          bookingCount: listing._count.bookings,
          isFavorite,
        },
      });
    } catch (error) {
      console.error('Get listing error:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت اقامتگاه',
      });
    }
  },

  // Update listing
  update: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const hostId = req.user?.id;

      // Check ownership
      const listing = await prisma.listing.findFirst({
        where: { id, hostId },
      });

      if (!listing) {
        return res.status(404).json({
          success: false,
          message: 'اقامتگاه یافت نشد یا شما دسترسی ندارید',
        });
      }

      // Update listing
      const updatedListing = await prisma.listing.update({
        where: { id },
        data: {
          ...req.body,
          latitude: req.body.latitude ? parseFloat(req.body.latitude) : undefined,
          longitude: req.body.longitude ? parseFloat(req.body.longitude) : undefined,
          pricePerNight: req.body.pricePerNight ? parseInt(req.body.pricePerNight) : undefined,
          extraGuestFee: req.body.extraGuestFee ? parseInt(req.body.extraGuestFee) : undefined,
          weekendExtraCharge: req.body.weekendExtraCharge ? parseInt(req.body.weekendExtraCharge) : undefined,
          area: req.body.area ? parseInt(req.body.area) : undefined,
          maxGuests: req.body.maxGuests ? parseInt(req.body.maxGuests) : undefined,
          bedrooms: req.body.bedrooms ? parseInt(req.body.bedrooms) : undefined,
          beds: req.body.beds ? parseInt(req.body.beds) : undefined,
          bathrooms: req.body.bathrooms ? parseInt(req.body.bathrooms) : undefined,
        },
        include: {
          images: true,
        },
      });

      res.json({
        success: true,
        message: 'اقامتگاه با موفقیت بروزرسانی شد',
        data: updatedListing,
      });
    } catch (error) {
      console.error('Update listing error:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در بروزرسانی اقامتگاه',
      });
    }
  },

  // Delete listing
  delete: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const hostId = req.user?.id;

      // Check ownership
      const listing = await prisma.listing.findFirst({
        where: { id, hostId },
        include: {
          images: true,
          bookings: {
            where: {
              status: {
                in: ['PENDING', 'CONFIRMED'],
              },
              checkOut: {
                gte: new Date(),
              },
            },
          },
        },
      });

      if (!listing) {
        return res.status(404).json({
          success: false,
          message: 'اقامتگاه یافت نشد یا شما دسترسی ندارید',
        });
      }

      // Check for active bookings
      if (listing.bookings.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'امکان حذف اقامتگاه با رزرو فعال وجود ندارد',
        });
      }

      // Delete images from cloudinary
      for (const image of listing.images) {
        const publicId = image.url.split('/').slice(-2).join('/').split('.')[0];
        await deleteFromCloudinary(publicId);
      }

      // Delete listing
      await prisma.listing.delete({
        where: { id },
      });

      res.json({
        success: true,
        message: 'اقامتگاه با موفقیت حذف شد',
      });
    } catch (error) {
      console.error('Delete listing error:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در حذف اقامتگاه',
      });
    }
  },

  // Get host listings
  getHostListings: async (req: Request, res: Response) => {
    try {
      const hostId = req.user?.id;
      const { page = 1, limit = 10, status } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const where: any = { hostId };
      if (status) where.status = status;

      const [listings, total] = await Promise.all([
        prisma.listing.findMany({
          where,
          include: {
            images: {
              orderBy: { order: 'asc' },
              take: 1,
            },
            _count: {
              select: {
                bookings: true,
                reviews: true,
              },
            },
          },
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
        }),
        prisma.listing.count({ where }),
      ]);

      res.json({
        success: true,
        data: {
          items: listings,
          total,
          page: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      console.error('Get host listings error:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت اقامتگاه‌های میزبان',
      });
    }
  },

  // Update listing status
  updateStatus: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const hostId = req.user?.id;

      // Check ownership
      const listing = await prisma.listing.findFirst({
        where: { id, hostId },
      });

      if (!listing) {
        return res.status(404).json({
          success: false,
          message: 'اقامتگاه یافت نشد یا شما دسترسی ندارید',
        });
      }

      // Update status
      const updatedListing = await prisma.listing.update({
        where: { id },
        data: { status },
      });

      res.json({
        success: true,
        message: 'وضعیت اقامتگاه با موفقیت تغییر یافت',
        data: updatedListing,
      });
    } catch (error) {
      console.error('Update listing status error:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در تغییر وضعیت اقامتگاه',
      });
    }
  },
};
