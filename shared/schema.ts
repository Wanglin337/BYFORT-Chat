import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phoneNumber: text("phone_number").notNull().unique(),
  pin: text("pin").notNull(),
  name: text("name").notNull(),
  balance: integer("balance").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // 'topup', 'withdraw', 'send', 'receive'
  amount: integer("amount").notNull(),
  originalAmount: integer("original_amount").notNull(),
  adminFee: integer("admin_fee").notNull().default(1200),
  status: text("status").notNull().default("pending"), // 'pending', 'approved', 'rejected'
  recipientPhone: text("recipient_phone"),
  recipientName: text("recipient_name"),
  bankName: text("bank_name"),
  accountNumber: text("account_number"),
  senderName: text("sender_name"),
  proofImageUrl: text("proof_image_url"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  phoneNumber: true,
  pin: true,
  name: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// Login schema
export const loginSchema = z.object({
  phoneNumber: z.string().min(10, "Nomor HP tidak valid"),
  pin: z.string().length(6, "PIN harus 6 digit"),
});

export const createPinSchema = z.object({
  phoneNumber: z.string().min(10, "Nomor HP tidak valid"),
  pin: z.string().length(6, "PIN harus 6 digit"),
  name: z.string().min(2, "Nama minimal 2 karakter"),
});

// Transaction schemas
export const topUpSchema = z.object({
  senderName: z.string().min(2, "Nama pengirim wajib diisi"),
  bankName: z.string().min(1, "Pilih bank/e-wallet"),
  accountNumber: z.string().min(1, "Nomor rekening wajib diisi"),
  originalAmount: z.number().min(12000, "Minimal top up Rp 12.000").max(10000000, "Maksimal top up Rp 10.000.000"),
  proofImageUrl: z.string().min(1, "Upload bukti transfer"),
});

export const withdrawSchema = z.object({
  recipientName: z.string().min(2, "Nama penerima wajib diisi"),
  bankName: z.string().min(1, "Pilih bank/e-wallet"),
  accountNumber: z.string().min(1, "Nomor rekening wajib diisi"),
  originalAmount: z.number().min(55000, "Minimal penarikan Rp 55.000").max(10000000, "Maksimal penarikan Rp 10.000.000"),
});

export const sendMoneySchema = z.object({
  recipientPhone: z.string().min(10, "Nomor HP tidak valid"),
  originalAmount: z.number().min(10000, "Minimal kirim Rp 10.000").max(10000000, "Maksimal kirim Rp 10.000.000"),
  notes: z.string().optional(),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type CreatePinRequest = z.infer<typeof createPinSchema>;
export type TopUpRequest = z.infer<typeof topUpSchema>;
export type WithdrawRequest = z.infer<typeof withdrawSchema>;
export type SendMoneyRequest = z.infer<typeof sendMoneySchema>;
