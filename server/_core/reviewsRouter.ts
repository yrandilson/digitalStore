import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "./trpc";
import { getDb } from "../db";
import { reviews, users, products, orders, orderItems } from "../../drizzle/schema";
import { and, avg, count, desc, eq, sql } from "drizzle-orm";

export const reviewsRouter = router({
  /**
   * List reviews for a product (public)
   */
  byProduct: publicProcedure
    .input(
      z.object({
        productId: z.number().int().positive(),
        page: z.number().int().positive().default(1),
        limit: z.number().int().positive().max(50).default(10),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const offset = (input.page - 1) * input.limit;

      const data = await db
        .select({
          id: reviews.id,
          rating: reviews.rating,
          title: reviews.title,
          comment: reviews.comment,
          helpful: reviews.helpful,
          verified: reviews.verified,
          createdAt: reviews.createdAt,
          userName: users.name,
        })
        .from(reviews)
        .leftJoin(users, eq(reviews.userId, users.id))
        .where(eq(reviews.productId, input.productId))
        .orderBy(desc(reviews.createdAt))
        .limit(input.limit)
        .offset(offset);

      const countResult = await db
        .select({ count: count() })
        .from(reviews)
        .where(eq(reviews.productId, input.productId));

      const total = Number(countResult[0]?.count || 0);

      return {
        data,
        pagination: { page: input.page, limit: input.limit, total, totalPages: Math.ceil(total / input.limit) },
      };
    }),

  /**
   * Create a review (authenticated, one per product per user)
   */
  create: protectedProcedure
    .input(
      z.object({
        productId: z.number().int().positive(),
        rating: z.number().int().min(1).max(5),
        title: z.string().min(2).max(255).optional(),
        comment: z.string().min(2).max(2000).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      // Check if user already reviewed this product
      const [existing] = await db
        .select({ id: reviews.id })
        .from(reviews)
        .where(and(eq(reviews.productId, input.productId), eq(reviews.userId, ctx.user.id)))
        .limit(1);

      if (existing) {
        throw new Error("Você já avaliou este produto");
      }

      // Check if user has purchased this product (verified review)
      const purchaseCheck = await db
        .select({ id: orderItems.id })
        .from(orderItems)
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .where(
          and(
            eq(orderItems.productId, input.productId),
            eq(orders.userId, ctx.user.id),
            eq(orders.status, "completed")
          )
        )
        .limit(1);

      const isVerified = purchaseCheck.length > 0;

      await db.insert(reviews).values({
        productId: input.productId,
        userId: ctx.user.id,
        rating: input.rating,
        title: input.title || null,
        comment: input.comment || null,
        verified: isVerified,
      });

      // Recalculate product average rating and review count
      const [avgResult] = await db
        .select({
          avgRating: avg(reviews.rating),
          reviewCount: count(),
        })
        .from(reviews)
        .where(eq(reviews.productId, input.productId));

      await db
        .update(products)
        .set({
          rating: String(Number(avgResult?.avgRating || 0).toFixed(2)),
          reviewCount: Number(avgResult?.reviewCount || 0),
        })
        .where(eq(products.id, input.productId));

      return { success: true };
    }),
});
