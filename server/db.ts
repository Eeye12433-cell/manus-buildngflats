import { eq, and, gte, lte, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, apartments, feeCategories, monthlyFees, payments, notifications } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ APARTMENT QUERIES ============

export async function getAllApartments() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(apartments).orderBy(apartments.floorNumber, apartments.unitNumber);
}

export async function getApartmentById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(apartments).where(eq(apartments.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getApartmentsByFloor(floorNumber: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(apartments).where(eq(apartments.floorNumber, floorNumber)).orderBy(apartments.unitNumber);
}

export async function searchApartments(searchTerm: string) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(apartments).where(
    sql`${apartments.ownerName} LIKE ${`%${searchTerm}%`} OR ${apartments.ownerEmail} LIKE ${`%${searchTerm}%`} OR ${apartments.ownerPhone} LIKE ${`%${searchTerm}%`}`
  ).orderBy(apartments.floorNumber, apartments.unitNumber);
}

export async function createApartment(data: typeof apartments.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(apartments).values(data);
  return result;
}

export async function updateApartment(id: number, data: Partial<typeof apartments.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(apartments).set(data).where(eq(apartments.id, id));
}

export async function deleteApartment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(apartments).where(eq(apartments.id, id));
}

// ============ FEE CATEGORY QUERIES ============

export async function getAllFeeCategories() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(feeCategories).where(eq(feeCategories.isActive, true));
}

export async function createFeeCategory(data: typeof feeCategories.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(feeCategories).values(data);
}

export async function updateFeeCategory(id: number, data: Partial<typeof feeCategories.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(feeCategories).set(data).where(eq(feeCategories.id, id));
}

// ============ MONTHLY FEE QUERIES ============

export async function getMonthlyFees(month: Date) {
  const db = await getDb();
  if (!db) return [];
  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
  return await db.select().from(monthlyFees).where(eq(monthlyFees.month, monthStart));
}

export async function createMonthlyFee(data: typeof monthlyFees.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(monthlyFees).values(data);
}

export async function updateMonthlyFee(id: number, data: Partial<typeof monthlyFees.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(monthlyFees).set(data).where(eq(monthlyFees.id, id));
}

// ============ PAYMENT QUERIES ============

export async function getPaymentsByApartment(apartmentId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(payments).where(eq(payments.apartmentId, apartmentId)).orderBy(desc(payments.month));
}

export async function getPaymentsByMonth(month: Date) {
  const db = await getDb();
  if (!db) return [];
  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
  return await db.select().from(payments).where(eq(payments.month, monthStart));
}

export async function createPayment(data: typeof payments.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(payments).values(data);
}

export async function getOutstandingPayments(month: Date) {
  const db = await getDb();
  if (!db) return [];
  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
  
  // Get all apartments and their payments for the month
  const allApartments = await getAllApartments();
  const paidApartments = await db.select({ apartmentId: payments.apartmentId }).from(payments).where(eq(payments.month, monthStart));
  const paidIds = new Set(paidApartments.map(p => p.apartmentId));
  
  return allApartments.filter(apt => !paidIds.has(apt.id));
}

// ============ NOTIFICATION QUERIES ============

export async function createNotification(data: typeof notifications.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(notifications).values(data);
}

export async function getUnreadNotifications() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(notifications).where(eq(notifications.isRead, false)).orderBy(desc(notifications.createdAt));
}

export async function getAllNotifications() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(notifications).orderBy(desc(notifications.createdAt)).limit(50);
}

export async function markNotificationAsRead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(notifications).set({ isRead: true, readAt: new Date() }).where(eq(notifications.id, id));
}

// ============ FINANCIAL REPORT QUERIES ============

export async function getMonthlyRevenue(month: Date) {
  const db = await getDb();
  if (!db) return { total: 0, byCategory: [] };
  
  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
  const monthPayments = await db.select().from(payments).where(eq(payments.month, monthStart));
  
  const total = monthPayments.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);
  
  return { total, count: monthPayments.length };
}

export async function getCollectionRate(month: Date) {
  const db = await getDb();
  if (!db) return { collected: 0, total: 0, rate: 0 };
  
  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
  const allApartments = await getAllApartments();
  const monthlyFeesList = await db.select().from(monthlyFees).where(eq(monthlyFees.month, monthStart));
  
  const totalExpected = monthlyFeesList.reduce((sum, f) => sum + parseFloat(f.amount.toString()), 0) * allApartments.length;
  
  const monthPayments = await db.select().from(payments).where(eq(payments.month, monthStart));
  const collected = monthPayments.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);
  
  const rate = totalExpected > 0 ? (collected / totalExpected) * 100 : 0;
  
  return { collected, total: totalExpected, rate };
}
