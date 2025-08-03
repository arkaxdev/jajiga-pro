import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { addDays, differenceInDays, isWeekend } from 'date-fns';

const prisma = new PrismaClient();

export const bookingController = {
  // Check availability
  checkAvailability: async (req: Request, res: Response) => {
    try {
      const { listingId, checkIn, checkOut, guestCount } = req.body;

      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      // Validate dates
      if (checkInDate >= checkOutDate) {
        return res.status(400).json({
          success: false,
          message: 'تاریخ ورود باید قبل از تاریخ خروج باشد',
        });
      }

      // Get listing
      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
      });

      if (!listing) {
        return res.status(404).json({
          success: false,
          message: 'اقامتگاه یافت نشد',
        });
      }

      // Check guest count
      if (guestCount > listing.maxGuests) {
        return res.status(400).json({
          success: false,
          message: `حداکثر ظرفیت این اقامتگاه ${listing.maxGuests} نفر است`,
        });
      }

      // Check for conflicting bookings
      const conflicts = await prisma.booking.findMany({
        where: {
          listingId,
          status: {
            in: ['PENDING', 'CONFIRMED'],
          },
          OR: [
            {
              AND: [
                { checkIn: { lte: checkInDate } },
                { checkOut: { gt: checkInDate } },
              ],
            },
            {
              AND: [
                { checkIn: { lt: checkOutDate } },
                { checkOut: { gte: checkOutDate } },
              ],
            },
            {
              AND: [
                { checkIn: { gte: checkInDate } },
                { checkOut: { lte: checkOutDate } },
              ],
            },
          ],
        },
        select: {
          checkIn: true,
          checkOut: true,
        },
      });

      const isAvailable = conflicts.length === 0;

      res.json({
        success: true,
        data: {
          isAvailable,
          conflicts: conflicts.map(c => ({
            checkIn: c.checkIn.toISOString(),
            checkOut: c.checkOut.toISOString(),
          })),
        },
      });
    } catch (error) {
      console.error('Check availability error:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در بررسی دسترسی',
      });
    }
  },

  // Calculate price
  calculatePrice: async (req: Request, res: Response) => {
    try {
      const { listingId, checkIn, checkOut, guestCount } = req.body;

      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      const nights = differenceInDays(checkOutDate, checkInDate);

      if (nights <= 0) {
        return res.status(400).json({
          success: false,
          message: 'تعداد شب‌ها باید بیشتر از صفر باشد',
        });
      }

      // Get listing
      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
      });

      if (!listing) {
        return res.status(404).json({
          success: false,
          message: 'اقامتگاه یافت نشد',
        });
      }

      // Calculate price breakdown
      let totalPrice = 0;
      let weekendNights = 0;
      const breakdown = [];

      for (let i = 0; i < nights; i++) {
        const currentDate = addDays(checkInDate, i);
        const isWeekendDay = isWeekend(currentDate);
        
        let nightPrice = listing.pricePerNight;
        
        // Add weekend extra charge
        if (isWeekendDay && listing.weekendExtraCharge) {
          nightPrice += listing.weekendExtraCharge;
          weekendNights++;
        }

        breakdown.push({
          date: currentDate.toISOString(),
          price: nightPrice,
          isWeekend: isWeekendDay,
          isHoliday: false, // TODO: Check holidays
        });

        totalPrice += nightPrice;
      }

      // Add extra guest fee
      let extraGuestFee = 0;
      if (guestCount > listing.baseGuests && listing.extraGuestFee) {
        const extraGuests = guestCount - listing.baseGuests;
        extraGuestFee = extraGuests * listing.extraGuestFee * nights;
        totalPrice += extraGuestFee;
      }

      // Calculate service fee (10%)
      const serviceFee = Math.round(totalPrice * 0.1);
      totalPrice += serviceFee;

      res.json({
        success: true,
        data: {
          nights,
          basePrice: listing.pricePerNight * nights,
          extraGuestFee,
          weekendNights,
          weekendExtraCharge: weekendNights * (listing.weekendExtraCharge || 0),
          serviceFee,
          totalPrice,
          breakdown,
        },
      });
    } catch (error) {
      console.error('Calculate price error:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در محاسبه قیمت',
      });
    }
  },

  // Create booking
  create: async (req: Request, res: Response) => {
    try {
      const guestId = req.user?.id;
      const {
        listingId,
        checkIn,
        checkOut,
        guestCount,
        totalPrice,
        guestName,
        guestMobile,
        guestEmail,
        specialRequests,
      } = req.body;

      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      // Check availability again
      const availabilityCheck = await bookingController.checkAvailability(req, res);
      if (!res.headersSent) return;

      // Create booking
      const booking = await prisma.booking.create({
        data: {
          listingId,
          guestId,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          guestCount,
          totalPrice,
          guestName,
          guestMobile,
          guestEmail,
          specialRequests,
          status: 'PENDING',
        },
        include: {
          listing: {
            include: {
              host: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  mobile: true,
                },
              },
              images: {
                take: 1,
                orderBy: { order: 'asc' },
              },
            },
          },
        },
      });

      // TODO: Send notification to host
      // TODO: Send confirmation email to guest

      res.status(201).json({
        success: true,
        message: 'رزرو با موفقیت ثبت شد',
        data: booking,
      });
    } catch (error) {
      console.error('Create booking error:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در ثبت رزرو',
      });
    }
  },

  // Get booking by ID
  getById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const booking = await prisma.booking.findUnique({
        where: { id },
        include: {
          listing: {
            include: {
              host: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  mobile: true,
                  avatar: true,
                },
              },
              images: true,
            },
          },
          guest: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              mobile: true,
              avatar: true,
            },
          },
          payment: true,
          messages: {
            include: {
              sender: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'رزرو یافت نشد',
        });
      }

      // Check access
      if (booking.guestId !== userId && booking.listing.hostId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'شما دسترسی به این رزرو ندارید',
        });
      }

      res.json({
        success: true,
        data: booking,
      });
    } catch (error) {
      console.error('Get booking error:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت رزرو',
      });
    }
  },

  // Get guest bookings
  getMyBookings: async (req: Request, res: Response) => {
    try {
      const guestId = req.user?.id;
      const { page = 1, limit = 10, status } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const where: any = { guestId };
      if (status) where.status = status;

      const [bookings, total] = await Promise.all([
        prisma.booking.findMany({
          where,
          include: {
            listing: {
              include: {
                images: {
                  take: 1,
                  orderBy: { order: 'asc' },
                },
                host: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
            payment: {
              select: {
                status: true,
              },
            },
          },
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
        }),
        prisma.booking.count({ where }),
      ]);

      res.json({
        success: true,
        data: {
          items: bookings,
          total,
          page: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      console.error('Get my bookings error:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت رزروها',
      });
    }
  },

  // Get host bookings
  getHostBookings: async (req: Request, res: Response) => {
    try {
      const hostId = req.user?.id;
      const { page = 1, limit = 10, status, listingId, startDate, endDate } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {
        listing: { hostId },
      };
      
      if (status) where.status = status;
      if (listingId) where.listingId = listingId;
      if (startDate || endDate) {
        where.checkIn = {};
        if (startDate) where.checkIn.gte = new Date(startDate as string);
        if (endDate) where.checkIn.lte = new Date(endDate as string);
      }

      const [bookings, total] = await Promise.all([
        prisma.booking.findMany({
          where,
          include: {
            listing: {
              select: {
                id: true,
                title: true,
                images: {
                  take: 1,
                  orderBy: { order: 'asc' },
                },
              },
            },
            guest: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                mobile: true,
                avatar: true,
              },
            },
            payment: {
              select: {
                status: true,
              },
            },
          },
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
        }),
        prisma.booking.count({ where }),
      ]);

      res.json({
        success: true,
        data: {
          items: bookings,
          total,
          page: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      console.error('Get host bookings error:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت رزروها',
      });
    }
  },

  // Update booking status (host)
  updateStatus: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;
      const hostId = req.user?.id;

      // Get booking with listing
      const booking = await prisma.booking.findUnique({
        where: { id },
        include: {
          listing: {
            select: {
              hostId: true,
            },
          },
        },
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'رزرو یافت نشد',
        });
      }

      // Check ownership
      if (booking.listing.hostId !== hostId) {
        return res.status(403).json({
          success: false,
          message: 'شما دسترسی به این رزرو ندارید',
        });
      }

      // Check if status change is valid
      if (booking.status !== 'PENDING') {
        return res.status(400).json({
          success: false,
          message: 'امکان تغییر وضعیت این رزرو وجود ندارد',
        });
      }

      // Update status
      const updatedBooking = await prisma.booking.update({
        where: { id },
        data: {
          status,
          rejectionReason: status === 'REJECTED' ? reason : null,
        },
      });

      // TODO: Send notification to guest

      res.json({
        success: true,
        message: status === 'CONFIRMED' ? 'رزرو تأیید شد' : 'رزرو رد شد',
        data: updatedBooking,
      });
    } catch (error) {
      console.error('Update booking status error:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در تغییر وضعیت رزرو',
      });
    }
  },

  // Cancel booking
  cancel: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const userId = req.user?.id;

      // Get booking
      const booking = await prisma.booking.findUnique({
        where: { id },
        include: {
          listing: {
            select: {
              hostId: true,
              cancellationPolicy: true,
            },
          },
        },
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'رزرو یافت نشد',
        });
      }

      // Check access
      if (booking.guestId !== userId && booking.listing.hostId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'شما دسترسی به لغو این رزرو ندارید',
        });
      }

      // Check if booking can be cancelled
      if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
        return res.status(400).json({
          success: false,
          message: 'امکان لغو این رزرو وجود ندارد',
        });
      }

      // Calculate refund based on cancellation policy
      // TODO: Implement cancellation policy logic

      // Update booking
      const updatedBooking = await prisma.booking.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          cancellationReason: reason,
          cancelledBy: userId,
          cancelledAt: new Date(),
        },
      });

      // TODO: Process refund if payment was made
      // TODO: Send notifications

      res.json({
        success: true,
        message: 'رزرو با موفقیت لغو شد',
        data: updatedBooking,
      });
    } catch (error) {
      console.error('Cancel booking error:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در لغو رزرو',
      });
    }
  },
};
