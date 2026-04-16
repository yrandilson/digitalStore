import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { productsRouter } from "./_core/productsRouter";
import { ordersRouter } from "./_core/ordersRouter";
import { usersRouter } from "./_core/usersRouter";
import { downloadsRouter } from "./_core/downloadsRouter";
import { reviewsRouter } from "./_core/reviewsRouter";
import { publicProcedure, router } from "./_core/trpc";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
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

  products: productsRouter,
  orders: ordersRouter,
  users: usersRouter,
  downloads: downloadsRouter,
  reviews: reviewsRouter,
});

export type AppRouter = typeof appRouter;
