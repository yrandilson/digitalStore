import { z } from "zod";
import { router, publicProcedure, protectedProcedure, adminProcedure } from "./trpc";
import { getDb } from "../db";
import { orders, orderItems, downloads, products } from "../../drizzle/schema";
import { and, count, desc, eq, sql, sum } from "drizzle-orm";

export const ordersRouter = router({
  /**
   * Create a new order from cart items (authenticated users only)
   */
  create: protectedProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            productId: z.number().int().positive(),
            productName: z.string().min(1),
            productPrice: z.string().regex(/^\d+(\.\d{1,2})?$/),
            quantity: z.number().int().positive().default(1),
          })
        ).min(1),
        customerEmail: z.string().email(),
        customerName: z.string().min(2).max(255),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      // Calculate total
      const totalAmount = input.items
        .reduce((sum, item) => sum + parseFloat(item.productPrice) * item.quantity, 0)
        .toFixed(2);

      // Insert order
      await db.insert(orders).values({
        userId: ctx.user.id,
        status: "pending",
        totalAmount,
        currency: "BRL",
        customerEmail: input.customerEmail,
        customerName: input.customerName,
      });

      // Get the created order (last insert)
      const [createdOrder] = await db
        .select()
        .from(orders)
        .where(eq(orders.userId, ctx.user.id))
        .orderBy(desc(orders.createdAt))
        .limit(1);

      if (!createdOrder) throw new Error("Falha ao criar pedido");

      // Insert order items
      for (const item of input.items) {
        await db.insert(orderItems).values({
          orderId: createdOrder.id,
          productId: item.productId,
          productName: item.productName,
          productPrice: item.productPrice,
          quantity: item.quantity,
        });

        // Create download entry for each product
        await db.insert(downloads).values({
          userId: ctx.user.id,
          productId: item.productId,
          orderId: createdOrder.id,
          downloadCount: 0,
        });

        // Increment sales count
        await db
          .update(products)
          .set({ salesCount: sql`${products.salesCount} + ${item.quantity}` })
          .where(eq(products.id, item.productId));
      }

      return createdOrder;
    }),

  /**
   * List orders for the authenticated user
   */
  listMine: protectedProcedure
    .input(
      z.object({
        page: z.number().int().positive().default(1),
        limit: z.number().int().positive().max(50).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const offset = (input.page - 1) * input.limit;

      const data = await db
        .select()
        .from(orders)
        .where(eq(orders.userId, ctx.user.id))
        .orderBy(desc(orders.createdAt))
        .limit(input.limit)
        .offset(offset);

      const countResult = await db
        .select({ count: count() })
        .from(orders)
        .where(eq(orders.userId, ctx.user.id));

      const total = Number(countResult[0]?.count || 0);

      return { data, pagination: { page: input.page, limit: input.limit, total, totalPages: Math.ceil(total / input.limit) } };
    }),

  /**
   * List all orders (admin only)
   */
  listAll: adminProcedure
    .input(
      z.object({
        page: z.number().int().positive().default(1),
        limit: z.number().int().positive().max(100).default(20),
        status: z.enum(["pending", "completed", "failed", "refunded"]).optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const offset = (input.page - 1) * input.limit;
      const filters = input.status ? [eq(orders.status, input.status)] : [];
      const whereClause = filters.length > 0 ? and(...filters) : undefined;

      const data = await db
        .select()
        .from(orders)
        .where(whereClause)
        .orderBy(desc(orders.createdAt))
        .limit(input.limit)
        .offset(offset);

      const countResult = await db
        .select({ count: count() })
        .from(orders)
        .where(whereClause);

      const total = Number(countResult[0]?.count || 0);

      return { data, pagination: { page: input.page, limit: input.limit, total, totalPages: Math.ceil(total / input.limit) } };
    }),

  /**
   * Get order details with items
   */
  byId: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const [order] = await db.select().from(orders).where(eq(orders.id, input.id)).limit(1);
      if (!order) throw new Error("Pedido não encontrado");

      // Ensure user owns the order or is admin
      if (order.userId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new Error("Acesso negado");
      }

      const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));

      return { ...order, items };
    }),

  /**
   * Update order status (admin only)
   */
  updateStatus: adminProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        status: z.enum(["pending", "completed", "failed", "refunded"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      await db.update(orders).set({ status: input.status }).where(eq(orders.id, input.id));

      const [updated] = await db.select().from(orders).where(eq(orders.id, input.id)).limit(1);
      return updated;
    }),

  /**
   * Dashboard stats (admin only)
   */
  stats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    const [revenueResult] = await db
      .select({ total: sum(orders.totalAmount) })
      .from(orders)
      .where(eq(orders.status, "completed"));

    const [orderCount] = await db.select({ count: count() }).from(orders);

    const [completedCount] = await db
      .select({ count: count() })
      .from(orders)
      .where(eq(orders.status, "completed"));

    const [pendingCount] = await db
      .select({ count: count() })
      .from(orders)
      .where(eq(orders.status, "pending"));

    return {
      totalRevenue: Number(revenueResult?.total || 0),
      totalOrders: Number(orderCount?.count || 0),
      completedOrders: Number(completedCount?.count || 0),
      pendingOrders: Number(pendingCount?.count || 0),
    };
  }),
});
