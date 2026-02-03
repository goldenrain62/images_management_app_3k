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
  phoneNumber: varchar("phone_number", { length: 20 }),
  avatarUrl: varchar("avatar_url", { length: 250 }),
  facebookUrl: varchar("facebook_url", { length: 250 }),
  zaloUrl: varchar("zalo_url", { length: 250 }),
  tiktokUrl: varchar("tiktok_url", { length: 250 }),
  instagramUrl: varchar("instagram_url", { length: 250 }),
  address: varchar("address", { length: 250 }),
  ward: varchar("ward", { length: 100 }),
  province: varchar("province", { length: 100 }),
  title: varchar("title", { length: 100 }),
  isActive: boolean("is_active").default(true).notNull(),
  roleId: int("role_id")
    .notNull()
    .references(() => roles.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// --- Category Table ---
export const categories = mysqlTable("categories", {
  id: varchar("id", { length: 6 }).primaryKey(), // Using String PK as requested
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description"),
  userId: int("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// --- Image Table ---
export const images = mysqlTable("images", {
  id: varchar("id", { length: 15 }).primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  size: int("size").notNull(),
  productUrl: text("product_url"),
  imageUrl: text("image_url"),
  thumbnailUrl: text("thumbnail_url"),
  categoryId: varchar("category_id", { length: 6 })
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  userId: int("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});
