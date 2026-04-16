import { relations } from "drizzle-orm";
import {
  users,
  categories,
  products,
  orders,
  orderItems,
  downloads,
  reviews,
  cartItems,
} from "./schema";

// ── User relations ──────────────────────────────────────────────────────────
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  downloads: many(downloads),
  reviews: many(reviews),
  cartItems: many(cartItems),
}));

// ── Category relations ──────────────────────────────────────────────────────
export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

// ── Product relations ───────────────────────────────────────────────────────
export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  orderItems: many(orderItems),
  downloads: many(downloads),
  reviews: many(reviews),
}));

// ── Order relations ─────────────────────────────────────────────────────────
export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
  downloads: many(downloads),
}));

// ── OrderItem relations ─────────────────────────────────────────────────────
export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

// ── Download relations ──────────────────────────────────────────────────────
export const downloadsRelations = relations(downloads, ({ one }) => ({
  user: one(users, {
    fields: [downloads.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [downloads.productId],
    references: [products.id],
  }),
  order: one(orders, {
    fields: [downloads.orderId],
    references: [orders.id],
  }),
}));

// ── Review relations ────────────────────────────────────────────────────────
export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
}));

// ── CartItem relations ──────────────────────────────────────────────────────
export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, {
    fields: [cartItems.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));
