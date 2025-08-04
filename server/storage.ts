import { type User, type InsertUser, type Transaction, type InsertTransaction, type Notification, type InsertNotification } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByPhone(phoneNumber: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(userId: string, newBalance: number): Promise<void>;
  verifyPin(phoneNumber: string, pin: string): Promise<User | null>;

  // Transactions
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactionsByUser(userId: string): Promise<Transaction[]>;
  getPendingTransactions(): Promise<Transaction[]>;
  updateTransactionStatus(transactionId: string, status: string): Promise<Transaction | undefined>;
  getTransaction(transactionId: string): Promise<Transaction | undefined>;

  // Notifications
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string): Promise<Notification[]>;
  markNotificationAsRead(notificationId: string): Promise<void>;

  // Admin
  getAllUsers(): Promise<User[]>;
  getTotalVolume(): Promise<number>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private transactions: Map<string, Transaction>;
  private notifications: Map<string, Notification>;

  constructor() {
    this.users = new Map();
    this.transactions = new Map();
    this.notifications = new Map();

    // Initialize with some demo data for admin
    this.initializeDemoData();
  }

  private initializeDemoData() {
    // Create a demo user
    const demoUser: User = {
      id: "demo-user-1",
      phoneNumber: "8123456789",
      pin: "123456", // In real app, this would be hashed
      name: "Demo User",
      balance: 125000,
      isActive: true,
      createdAt: new Date(),
    };
    this.users.set(demoUser.id, demoUser);

    // Create some demo transactions
    const demoTransaction: Transaction = {
      id: "demo-txn-1",
      userId: "demo-user-1",
      type: "topup",
      amount: 48800,
      originalAmount: 50000,
      adminFee: 1200,
      status: "pending",
      recipientPhone: null,
      recipientName: null,
      bankName: "BCA",
      accountNumber: "1234567890",
      senderName: "Demo User",
      proofImageUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.transactions.set(demoTransaction.id, demoTransaction);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByPhone(phoneNumber: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.phoneNumber === phoneNumber
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      balance: 0,
      isActive: true,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserBalance(userId: string, newBalance: number): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.balance = newBalance;
      this.users.set(userId, user);
    }
  }

  async verifyPin(phoneNumber: string, pin: string): Promise<User | null> {
    const user = await this.getUserByPhone(phoneNumber);
    if (user && user.pin === pin) {
      return user;
    }
    return null;
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const transaction: Transaction = {
      id,
      type: insertTransaction.type,
      status: insertTransaction.status || "pending",
      userId: insertTransaction.userId,
      amount: insertTransaction.amount,
      originalAmount: insertTransaction.originalAmount,
      adminFee: insertTransaction.adminFee,
      recipientPhone: insertTransaction.recipientPhone || null,
      recipientName: insertTransaction.recipientName || null,
      bankName: insertTransaction.bankName || null,
      accountNumber: insertTransaction.accountNumber || null,
      senderName: insertTransaction.senderName || null,
      proofImageUrl: insertTransaction.proofImageUrl || null,
      notes: insertTransaction.notes || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async getTransactionsByUser(userId: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter((txn) => txn.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getPendingTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter((txn) => txn.status === "pending")
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateTransactionStatus(transactionId: string, status: string): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(transactionId);
    if (transaction) {
      transaction.status = status;
      transaction.updatedAt = new Date();
      this.transactions.set(transactionId, transaction);
      return transaction;
    }
    return undefined;
  }

  async getTransaction(transactionId: string): Promise<Transaction | undefined> {
    return this.transactions.get(transactionId);
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = randomUUID();
    const notification: Notification = {
      ...insertNotification,
      id,
      isRead: false,
      createdAt: new Date(),
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter((notif) => notif.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    const notification = this.notifications.get(notificationId);
    if (notification) {
      notification.isRead = true;
      this.notifications.set(notificationId, notification);
    }
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getTotalVolume(): Promise<number> {
    return Array.from(this.transactions.values())
      .filter((txn) => txn.status === "approved")
      .reduce((total, txn) => total + txn.amount, 0);
  }
}

export const storage = new MemStorage();
