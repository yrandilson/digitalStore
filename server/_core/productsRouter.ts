import { z } from "zod";
import { router, publicProcedure, adminProcedure } from "./trpc";
import { getDb } from "../db";
import { products, categories } from "../../drizzle/schema";
import { and, asc, count, desc, eq, like } from "drizzle-orm";

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
      const baseFilters = [eq(products.active, true)];

      // Filter by category if provided
      if (input.categoryId) {
        baseFilters.push(eq(products.categoryId, input.categoryId));
      }

      const whereClause = baseFilters.length === 1 ? baseFilters[0] : and(...baseFilters);

      let data: typeof products.$inferSelect[] = [];

      // Apply sorting
      switch (input.sortBy) {
        case "popular":
          data = await db.select().from(products).where(whereClause).orderBy(desc(products.salesCount)).limit(input.limit).offset(offset);
          break;
        case "price-asc":
          data = await db.select().from(products).where(whereClause).orderBy(asc(products.price)).limit(input.limit).offset(offset);
          break;
        case "price-desc":
          data = await db.select().from(products).where(whereClause).orderBy(desc(products.price)).limit(input.limit).offset(offset);
          break;
        case "rating":
          data = await db.select().from(products).where(whereClause).orderBy(desc(products.rating)).limit(input.limit).offset(offset);
          break;
        case "newest":
        default:
          data = await db.select().from(products).where(whereClause).orderBy(desc(products.createdAt)).limit(input.limit).offset(offset);
      }
      
      // Get total count for pagination
      const countResult = await db
        .select({ count: count() })
        .from(products)
        .where(whereClause);

      const total = Number(countResult[0]?.count || 0);
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
        .where(and(eq(products.active, true), like(products.name, searchTerm)))
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
        .where(and(eq(products.featured, true), eq(products.active, true)))
        .orderBy(desc(products.createdAt))
        .limit(input.limit);

      return featuredProducts;
    }),

  /**
   * Create a new product
   */
  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(2).max(255),
        description: z.string().min(2),
        longDescription: z.string().min(2),
        price: z.string().regex(/^\d+(\.\d{1,2})?$/),
        categoryId: z.number().int().positive(),
        imageUrl: z.string().url().optional().or(z.literal("")),
        previewUrl: z.string().url().optional().or(z.literal("")),
        featured: z.boolean().default(false),
        active: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      let baseSlug = input.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80);

      // Auto-increment slug on collision (e.g. meu-produto, meu-produto-2, meu-produto-3)
      let slug = baseSlug;
      let suffix = 1;
      while (true) {
        const existing = await db
          .select({ id: products.id })
          .from(products)
          .where(eq(products.slug, slug))
          .limit(1);
        if (!existing[0]) break;
        suffix++;
        slug = `${baseSlug}-${suffix}`;
      }

      await db.insert(products).values({
        name: input.name,
        slug,
        description: input.description,
        longDescription: input.longDescription,
        price: input.price,
        categoryId: input.categoryId,
        imageUrl: input.imageUrl || null,
        previewUrl: input.previewUrl || null,
        featured: input.featured,
        active: input.active,
      });

      const created = await db
        .select()
        .from(products)
        .where(eq(products.slug, slug))
        .limit(1);

      if (!created[0]) {
        throw new Error("Falha ao criar produto");
      }

      return created[0];
    }),

  /**
   * Update an existing product (admin only)
   */
  update: adminProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        name: z.string().min(2).max(255).optional(),
        description: z.string().min(2).optional(),
        longDescription: z.string().min(2).optional(),
        price: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
        categoryId: z.number().int().positive().optional(),
        imageUrl: z.string().url().optional().or(z.literal("")),
        previewUrl: z.string().url().optional().or(z.literal("")),
        featured: z.boolean().optional(),
        active: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const { id, ...updateData } = input;
      const cleanData: Record<string, unknown> = {};

      for (const [key, value] of Object.entries(updateData)) {
        if (value !== undefined) {
          cleanData[key] = value === "" ? null : value;
        }
      }

      if (Object.keys(cleanData).length === 0) {
        throw new Error("Nenhum campo para atualizar");
      }

      await db.update(products).set(cleanData).where(eq(products.id, id));

      const [updated] = await db.select().from(products).where(eq(products.id, id)).limit(1);
      if (!updated) throw new Error("Produto não encontrado");

      return updated;
    }),

  /**
   * Delete a product (admin only)
   */
  delete: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const [existing] = await db.select({ id: products.id }).from(products).where(eq(products.id, input.id)).limit(1);
      if (!existing) throw new Error("Produto não encontrado");

      await db.delete(products).where(eq(products.id, input.id));

      return { success: true };
    }),

  /**
   * Get stats for dashboard (admin only)
   */
  stats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    const [totalResult] = await db.select({ count: count() }).from(products);
    const [activeResult] = await db
      .select({ count: count() })
      .from(products)
      .where(eq(products.active, true));

    return {
      totalProducts: Number(totalResult?.count || 0),
      activeProducts: Number(activeResult?.count || 0),
    };
  }),
});
