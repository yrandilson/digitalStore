import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import { getDb } from "../db";
import { products, categories, reviews } from "../../drizzle/schema";
import { eq, like, desc, asc } from "drizzle-orm";

export const productsRouter = router({
  /**
   * List all products with pagination and optional filters
   * Query params: page (default: 1), limit (default: 12), categoryId, sortBy
   */
  list: publicProcedure
    .input(
      z.object({
        page: z.number().int().positive().default(1),
        limit: z.number().int().positive().max(100).default(12),
        categoryId: z.number().int().optional(),
        sortBy: z.enum(["newest", "popular", "price-asc", "price-desc", "rating"]).default("newest"),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const offset = (input.page - 1) * input.limit;
      let query = db.select().from(products).where(eq(products.active, true));

      // Filter by category if provided
      if (input.categoryId) {
        query = db.select().from(products).where(
          eq(products.active, true) && eq(products.categoryId, input.categoryId)
        );
      }

      // Apply sorting
      let sortedQuery = query;
      switch (input.sortBy) {
        case "popular":
          sortedQuery = query.orderBy(desc(products.salesCount));
          break;
        case "price-asc":
          sortedQuery = query.orderBy(asc(products.price));
          break;
        case "price-desc":
          sortedQuery = query.orderBy(desc(products.price));
          break;
        case "rating":
          sortedQuery = query.orderBy(desc(products.rating));
          break;
        case "newest":
        default:
          sortedQuery = query.orderBy(desc(products.createdAt));
      }

      const data = await sortedQuery.limit(input.limit).offset(offset);
      
      // Get total count for pagination
      const countQuery = input.categoryId
        ? db.select({ count: products.id }).from(products).where(
            eq(products.active, true) && eq(products.categoryId, input.categoryId)
          )
        : db.select({ count: products.id }).from(products).where(eq(products.active, true));
      
      const countResult = await countQuery;
      const total = countResult[0]?.count || 0;
      const totalPages = Math.ceil(total / input.limit);

      return {
        data,
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          totalPages,
        },
      };
    }),

  /**
   * Get a single product by ID
   */
  byId: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const product = await db.select().from(products).where(eq(products.id, input.id)).limit(1);
      if (!product[0]) throw new Error("Product not found");

      return product[0];
    }),

  /**
   * Get a product by slug (for URL-friendly access)
   */
  bySlug: publicProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const product = await db.select().from(products).where(eq(products.slug, input.slug)).limit(1);
      if (!product[0]) throw new Error("Product not found");

      return product[0];
    }),

  /**
   * Search products by name or description
   */
  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(1).max(100),
        limit: z.number().int().positive().max(50).default(20),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const searchTerm = `%${input.query}%`;
      const results = await db
        .select()
        .from(products)
        .where(eq(products.active, true))
        .where(like(products.name, searchTerm))
        .limit(input.limit);

      return results;
    }),

  /**
   * Get all categories
   */
  categories: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    const allCategories = await db.select().from(categories).orderBy(asc(categories.name));
    return allCategories;
  }),

  /**
   * Get featured products
   */
  featured: publicProcedure
    .input(z.object({ limit: z.number().int().positive().max(50).default(8) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const featuredProducts = await db
        .select()
        .from(products)
        .where(eq(products.featured, true) && eq(products.active, true))
        .orderBy(desc(products.createdAt))
        .limit(input.limit);

      return featuredProducts;
    }),
});
