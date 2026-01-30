import {
  mysqlTable,
  serial,
  varchar,
  text,
  timestamp,
  boolean,
  int,
  date,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

// --- Role Table ---
export const roles = mysqlTable("roles", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// --- User Table ---
export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  gender: boolean("gender"),
  dateOfBirth: date("date_of_birth"),
  isActive: boolean("is_active").default(true).notNull(),
  roleId: int("role_id")
    .notNull()
    .references(() => roles.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// --- Category Table ---
export const categories = mysqlTable("categories", {
  id: varchar("id", { length: 255 }).primaryKey(), // Using String PK as requested
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description"),
  imagesQty: int("images_qty").default(0).notNull(),
  size: int("size").default(0).notNull(),
  userId: int("user_id")
    .notNull()
    .references(() => users.id),
});

// --- Image Table ---
export const images = mysqlTable("images", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  size: int("size").notNull(),
  productUrl: text("product_url"),
  imageUrl: text("image_url"),
  thumbnailUrl: text("thumbnail_url"),
  categoryId: varchar("category_id", { length: 255 })
    .notNull()
    .references(() => categories.id),
  userId: int("user_id")
    .notNull()
    .references(() => users.id),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});
