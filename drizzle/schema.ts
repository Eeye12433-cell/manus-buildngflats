import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, date } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Apartments table - stores information about each apartment in the building
 * Building has 15 floors with 4 apartments per floor (60 total)
 */
export const apartments = mysqlTable("apartments", {
  id: int("id").autoincrement().primaryKey(),
  floorNumber: int("floorNumber").notNull(), // 1-15
  unitNumber: int("unitNumber").notNull(), // 1-4 per floor
  ownerName: varchar("ownerName", { length: 255 }).notNull(),
  ownerEmail: varchar("ownerEmail", { length: 320 }),
  ownerPhone: varchar("ownerPhone", { length: 20 }),
  status: mysqlEnum("status", ["active", "vacant", "inactive"]).default("active").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Apartment = typeof apartments.$inferSelect;
export type InsertApartment = typeof apartments.$inferInsert;

/**
 * Fee categories table - defines the types of fees collected
 * Examples: maintenance, elevator, stairway electricity, cleaning, other services
 */
export const feeCategories = mysqlTable("feeCategories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(), // e.g., "Maintenance", "Elevator"
  description: text("description"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FeeCategory = typeof feeCategories.$inferSelect;
export type InsertFeeCategory = typeof feeCategories.$inferInsert;

/**
 * Monthly fees table - stores the fee amounts for each category per month
 * Allows flexibility to change fees month by month
 */
export const monthlyFees = mysqlTable("monthlyFees", {
  id: int("id").autoincrement().primaryKey(),
  month: date("month").notNull(), // First day of the month (YYYY-MM-01)
  feeCategoryId: int("feeCategoryId").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MonthlyFee = typeof monthlyFees.$inferSelect;
export type InsertMonthlyFee = typeof monthlyFees.$inferInsert;

/**
 * Payments table - tracks all payment transactions
 * Records when payments are made, by which method, and for which month
 */
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  apartmentId: int("apartmentId").notNull(),
  month: date("month").notNull(), // Month for which payment is made
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentDate: timestamp("paymentDate").notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["cash", "bank_transfer", "check", "online"]).notNull(),
  transactionId: varchar("transactionId", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

/**
 * Notifications table - stores alerts and messages for the building manager
 * Used for overdue payments, system updates, and other important events
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("type", ["overdue_payment", "payment_received", "system_update", "other"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  apartmentId: int("apartmentId"), // Optional - for apartment-specific notifications
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  readAt: timestamp("readAt"),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Building settings table - stores information about the building
 */
export const buildingSettings = mysqlTable("buildingSettings", {
  id: int("id").autoincrement().primaryKey(),
  buildingName: varchar("buildingName", { length: 255 }).notNull(),
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }),
  governorate: varchar("governorate", { length: 100 }),
  postalCode: varchar("postalCode", { length: 20 }),
  phoneNumber: varchar("phoneNumber", { length: 20 }),
  email: varchar("email", { length: 320 }),
  managerName: varchar("managerName", { length: 255 }),
  totalFloors: int("totalFloors").default(15).notNull(),
  unitsPerFloor: int("unitsPerFloor").default(4).notNull(),
  additionalInfo: text("additionalInfo"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BuildingSettings = typeof buildingSettings.$inferSelect;
export type InsertBuildingSettings = typeof buildingSettings.$inferInsert;
