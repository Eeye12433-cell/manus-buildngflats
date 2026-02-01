import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============ APARTMENT PROCEDURES ============
  apartments: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllApartments();
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const apartment = await db.getApartmentById(input.id);
        if (!apartment) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Apartment not found" });
        }
        return apartment;
      }),

    getByFloor: protectedProcedure
      .input(z.object({ floorNumber: z.number().min(1).max(15) }))
      .query(async ({ input }) => {
        return await db.getApartmentsByFloor(input.floorNumber);
      }),

    search: protectedProcedure
      .input(z.object({ searchTerm: z.string().min(1) }))
      .query(async ({ input }) => {
        return await db.searchApartments(input.searchTerm);
      }),

    create: protectedProcedure
      .input(z.object({
        floorNumber: z.number().min(1).max(15),
        unitNumber: z.number().min(1).max(4),
        ownerName: z.string().min(1),
        ownerEmail: z.string().email().optional(),
        ownerPhone: z.string().optional(),
        status: z.enum(["active", "vacant", "inactive"]).default("active"),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createApartment(input);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        floorNumber: z.number().min(1).max(15).optional(),
        unitNumber: z.number().min(1).max(4).optional(),
        ownerName: z.string().min(1).optional(),
        ownerEmail: z.string().email().optional(),
        ownerPhone: z.string().optional(),
        status: z.enum(["active", "vacant", "inactive"]).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await db.updateApartment(id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteApartment(input.id);
      }),
  }),

  // ============ FEE CATEGORY PROCEDURES ============
  feeCategories: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllFeeCategories();
    }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createFeeCategory({
          ...input,
          isActive: true,
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await db.updateFeeCategory(id, data);
      }),
  }),

  // ============ MONTHLY FEE PROCEDURES ============
  monthlyFees: router({
    getByMonth: protectedProcedure
      .input(z.object({ month: z.date() }))
      .query(async ({ input }) => {
        return await db.getMonthlyFees(input.month);
      }),

    create: protectedProcedure
      .input(z.object({
        month: z.date(),
        feeCategoryId: z.number(),
        amount: z.string().regex(/^\d+(\.\d{1,2})?$/),
      }))
      .mutation(async ({ input }) => {
        return await db.createMonthlyFee({
          month: input.month,
          feeCategoryId: input.feeCategoryId,
          amount: input.amount as any,
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        amount: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        const updateData: any = {};
        if (data.amount) updateData.amount = data.amount;
        return await db.updateMonthlyFee(id, updateData);
      }),
  }),

  // ============ PAYMENT PROCEDURES ============
  payments: router({
    getByApartment: protectedProcedure
      .input(z.object({ apartmentId: z.number() }))
      .query(async ({ input }) => {
        return await db.getPaymentsByApartment(input.apartmentId);
      }),

    getByMonth: protectedProcedure
      .input(z.object({ month: z.date() }))
      .query(async ({ input }) => {
        return await db.getPaymentsByMonth(input.month);
      }),

    create: protectedProcedure
      .input(z.object({
        apartmentId: z.number(),
        month: z.date(),
        amount: z.string().regex(/^\d+(\.\d{1,2})?$/),
        paymentDate: z.date(),
        paymentMethod: z.enum(["cash", "bank_transfer", "check", "online"]),
        transactionId: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // Create payment
        await db.createPayment({
          apartmentId: input.apartmentId,
          month: input.month,
          amount: input.amount as any,
          paymentDate: input.paymentDate,
          paymentMethod: input.paymentMethod,
          transactionId: input.transactionId,
          notes: input.notes,
        });

        // Create notification
        const apartment = await db.getApartmentById(input.apartmentId);
        if (apartment) {
          await db.createNotification({
            type: "payment_received",
            title: "Payment Received",
            content: `Payment of ${input.amount} received from ${apartment.ownerName} for ${input.month.toLocaleDateString()}`,
            apartmentId: input.apartmentId,
            isRead: false,
          });
        }

        return { success: true };
      }),
  }),

  // ============ NOTIFICATION PROCEDURES ============
  notifications: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllNotifications();
    }),

    unread: protectedProcedure.query(async () => {
      return await db.getUnreadNotifications();
    }),

    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.markNotificationAsRead(input.id);
      }),
  }),

  // ============ FINANCIAL REPORT PROCEDURES ============
  reports: router({
    monthlyRevenue: protectedProcedure
      .input(z.object({ month: z.date() }))
      .query(async ({ input }) => {
        return await db.getMonthlyRevenue(input.month);
      }),

    collectionRate: protectedProcedure
      .input(z.object({ month: z.date() }))
      .query(async ({ input }) => {
        return await db.getCollectionRate(input.month);
      }),

    outstandingPayments: protectedProcedure
      .input(z.object({ month: z.date() }))
      .query(async ({ input }) => {
        return await db.getOutstandingPayments(input.month);
      }),

    buildingOverview: protectedProcedure.query(async () => {
      const apartments = await db.getAllApartments();
      const currentMonth = new Date();
      const revenue = await db.getMonthlyRevenue(currentMonth);
      const collection = await db.getCollectionRate(currentMonth);
      const outstanding = await db.getOutstandingPayments(currentMonth);

      return {
        totalApartments: apartments.length,
        activeApartments: apartments.filter(a => a.status === "active").length,
        vacantApartments: apartments.filter(a => a.status === "vacant").length,
        monthlyRevenue: revenue.total,
        collectionCount: revenue.count,
        collectionRate: collection.rate,
        outstandingCount: outstanding.length,
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
