import { z } from "zod";
import { router, protectedProcedure } from "./trpc";
import { getDb } from "../db";
import { downloads, products } from "../../drizzle/schema";
import { desc, eq, sql } from "drizzle-orm";

export const downloadsRouter = router({
  /**
   * List downloads for the authenticated user
   */
  listMine: protectedProcedure
    .input(
      z.object({
        page: z.number().int().positive().default(1),
        limit: z.number().int().positive().max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const offset = (input.page - 1) * input.limit;

      const data = await db
        .select({
          id: downloads.id,
          productId: downloads.productId,
          orderId: downloads.orderId,
          downloadCount: downloads.downloadCount,
          lastDownloadedAt: downloads.lastDownloadedAt,
          createdAt: downloads.createdAt,
          productName: products.name,
          productSlug: products.slug,
          productImageUrl: products.imageUrl,
          fileName: products.fileName,
          fileSize: products.fileSize,
        })
        .from(downloads)
        .innerJoin(products, eq(downloads.productId, products.id))
        .where(eq(downloads.userId, ctx.user.id))
        .orderBy(desc(downloads.createdAt))
        .limit(input.limit)
        .offset(offset);

      return data;
    }),

  /**
   * Increment download count when user downloads a file
   */
  recordDownload: protectedProcedure
    .input(z.object({ downloadId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      // Verify ownership
      const [record] = await db
        .select()
        .from(downloads)
        .where(eq(downloads.id, input.downloadId))
        .limit(1);

      if (!record) throw new Error("Download não encontrado");
      if (record.userId !== ctx.user.id) throw new Error("Acesso negado");

      await db
        .update(downloads)
        .set({
          downloadCount: sql`${downloads.downloadCount} + 1`,
          lastDownloadedAt: new Date(),
        })
        .where(eq(downloads.id, input.downloadId));

      return { success: true };
    }),
});
