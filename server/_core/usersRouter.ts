import { z } from "zod";
import { router, adminProcedure } from "./trpc";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { count, desc, eq, like, or } from "drizzle-orm";

export const usersRouter = router({
  /**
   * List all users with pagination (admin only)
   */
  list: adminProcedure
    .input(
      z.object({
        page: z.number().int().positive().default(1),
        limit: z.number().int().positive().max(100).default(20),
        search: z.string().max(100).optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const offset = (input.page - 1) * input.limit;

      const filters = input.search
        ? or(
            like(users.name, `%${input.search}%`),
            like(users.email, `%${input.search}%`)
          )
        : undefined;

      const data = await db
        .select({
          id: users.id,
          openId: users.openId,
          name: users.name,
          email: users.email,
          role: users.role,
          createdAt: users.createdAt,
          lastSignedIn: users.lastSignedIn,
        })
        .from(users)
        .where(filters)
        .orderBy(desc(users.createdAt))
        .limit(input.limit)
        .offset(offset);

      const countResult = await db
        .select({ count: count() })
        .from(users)
        .where(filters);

      const total = Number(countResult[0]?.count || 0);

      return {
        data,
        pagination: { page: input.page, limit: input.limit, total, totalPages: Math.ceil(total / input.limit) },
      };
    }),

  /**
   * Update user role (admin only)
   */
  updateRole: adminProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        role: z.enum(["user", "admin"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      await db.update(users).set({ role: input.role }).where(eq(users.id, input.id));

      const [updated] = await db.select().from(users).where(eq(users.id, input.id)).limit(1);
      if (!updated) throw new Error("Usuário não encontrado");

      return updated;
    }),

  /**
   * Get total users count (admin only) - for dashboard stats
   */
  stats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    const [totalResult] = await db.select({ count: count() }).from(users);

    return {
      totalUsers: Number(totalResult?.count || 0),
    };
  }),
});
