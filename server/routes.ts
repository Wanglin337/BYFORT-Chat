import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { loginSchema, createPinSchema, topUpSchema, withdrawSchema, sendMoneySchema } from "@shared/schema";
import multer from "multer";
import path from "path";

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { phoneNumber, pin } = loginSchema.parse(req.body);
      
      const user = await storage.verifyPin(phoneNumber, pin);
      if (!user) {
        return res.status(401).json({ message: "Nomor HP atau PIN salah" });
      }

      res.json({
        user: {
          id: user.id,
          phoneNumber: user.phoneNumber,
          name: user.name,
          balance: user.balance,
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Terjadi kesalahan server" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { phoneNumber, pin, name } = createPinSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByPhone(phoneNumber);
      if (existingUser) {
        return res.status(400).json({ message: "Nomor HP sudah terdaftar" });
      }

      const user = await storage.createUser({
        phoneNumber,
        pin, // In production, hash this
        name,
      });

      res.json({
        user: {
          id: user.id,
          phoneNumber: user.phoneNumber,
          name: user.name,
          balance: user.balance,
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Terjadi kesalahan server" });
    }
  });

  app.post("/api/auth/check-user", async (req, res) => {
    try {
      const { phoneNumber } = z.object({ phoneNumber: z.string() }).parse(req.body);
      
      const user = await storage.getUserByPhone(phoneNumber);
      res.json({ exists: !!user });
    } catch (error) {
      res.status(400).json({ message: "Nomor HP tidak valid" });
    }
  });

  // User routes
  app.get("/api/user/:userId", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.userId);
      if (!user) {
        return res.status(404).json({ message: "User tidak ditemukan" });
      }

      res.json({
        id: user.id,
        phoneNumber: user.phoneNumber,
        name: user.name,
        balance: user.balance,
      });
    } catch (error) {
      res.status(500).json({ message: "Terjadi kesalahan server" });
    }
  });

  // Transaction routes
  app.post("/api/transactions/topup", upload.single('proofImage'), async (req, res) => {
    try {
      const { userId, senderName, bankName, accountNumber, originalAmount } = topUpSchema.extend({
        userId: z.string(),
      }).parse({
        ...req.body,
        originalAmount: parseInt(req.body.originalAmount),
      });

      if (!(req as any).file) {
        return res.status(400).json({ message: "Upload bukti transfer wajib" });
      }

      const proofImageUrl = `/uploads/${(req as any).file.filename}`;
      const adminFee = 1200;
      const amount = originalAmount - adminFee;

      const transaction = await storage.createTransaction({
        userId,
        type: "topup",
        amount,
        originalAmount,
        adminFee,
        status: "pending",
        recipientPhone: null,
        recipientName: null,
        bankName,
        accountNumber,
        senderName,
        proofImageUrl,
        notes: null,
      });

      res.json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Terjadi kesalahan server" });
    }
  });

  app.post("/api/transactions/withdraw", async (req, res) => {
    try {
      const { userId, recipientName, bankName, accountNumber, originalAmount } = withdrawSchema.extend({
        userId: z.string(),
      }).parse({
        ...req.body,
        originalAmount: parseInt(req.body.originalAmount),
      });

      // Check user balance
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User tidak ditemukan" });
      }

      const adminFee = 1200;
      const totalAmount = originalAmount + adminFee;

      if (user.balance < totalAmount) {
        return res.status(400).json({ message: "Saldo tidak mencukupi" });
      }

      // Deduct balance immediately
      await storage.updateUserBalance(userId, user.balance - totalAmount);

      const transaction = await storage.createTransaction({
        userId,
        type: "withdraw",
        amount: originalAmount,
        originalAmount,
        adminFee,
        status: "pending",
        recipientPhone: null,
        recipientName,
        bankName,
        accountNumber,
        senderName: null,
        proofImageUrl: null,
        notes: null,
      });

      res.json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Terjadi kesalahan server" });
    }
  });

  app.post("/api/transactions/send", async (req, res) => {
    try {
      const { userId, recipientPhone, originalAmount, notes } = sendMoneySchema.extend({
        userId: z.string(),
      }).parse({
        ...req.body,
        originalAmount: parseInt(req.body.originalAmount),
      });

      // Check sender balance
      const sender = await storage.getUser(userId);
      if (!sender) {
        return res.status(404).json({ message: "User tidak ditemukan" });
      }

      // Check if recipient exists
      const recipient = await storage.getUserByPhone(recipientPhone);
      if (!recipient) {
        return res.status(404).json({ message: "Penerima tidak terdaftar di BYFORT" });
      }

      if (sender.id === recipient.id) {
        return res.status(400).json({ message: "Tidak bisa mengirim ke diri sendiri" });
      }

      const adminFee = 1200;
      const totalAmount = originalAmount + adminFee;

      if (sender.balance < totalAmount) {
        return res.status(400).json({ message: "Saldo tidak mencukupi" });
      }

      // Process transfer immediately
      await storage.updateUserBalance(sender.id, sender.balance - totalAmount);
      await storage.updateUserBalance(recipient.id, recipient.balance + originalAmount);

      // Create sender transaction
      const senderTransaction = await storage.createTransaction({
        userId: sender.id,
        type: "send",
        amount: -originalAmount,
        originalAmount,
        adminFee,
        status: "approved",
        recipientPhone,
        recipientName: recipient.name,
        bankName: null,
        accountNumber: null,
        senderName: null,
        proofImageUrl: null,
        notes: notes || null,
      });

      // Create receiver transaction
      await storage.createTransaction({
        userId: recipient.id,
        type: "receive",
        amount: originalAmount,
        originalAmount,
        adminFee: 0,
        status: "approved",
        recipientPhone: null,
        recipientName: null,
        bankName: null,
        accountNumber: null,
        senderName: sender.name,
        proofImageUrl: null,
        notes: notes || null,
      });

      // Create notification for recipient
      await storage.createNotification({
        userId: recipient.id,
        title: "Saldo Masuk",
        message: `Anda menerima Rp ${originalAmount.toLocaleString()} dari ${sender.name}`,
      });

      res.json(senderTransaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Terjadi kesalahan server" });
    }
  });

  app.get("/api/transactions/:userId", async (req, res) => {
    try {
      const transactions = await storage.getTransactionsByUser(req.params.userId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Terjadi kesalahan server" });
    }
  });

  // Admin routes
  app.get("/api/admin/transactions/pending", async (req, res) => {
    try {
      const transactions = await storage.getPendingTransactions();
      
      // Get user details for each transaction
      const transactionsWithUsers = await Promise.all(
        transactions.map(async (txn) => {
          const user = await storage.getUser(txn.userId);
          return {
            ...txn,
            user: user ? {
              name: user.name,
              phoneNumber: user.phoneNumber,
            } : null,
          };
        })
      );

      res.json(transactionsWithUsers);
    } catch (error) {
      res.status(500).json({ message: "Terjadi kesalahan server" });
    }
  });

  app.post("/api/admin/transactions/:transactionId/approve", async (req, res) => {
    try {
      const transaction = await storage.getTransaction(req.params.transactionId);
      if (!transaction) {
        return res.status(404).json({ message: "Transaksi tidak ditemukan" });
      }

      await storage.updateTransactionStatus(transaction.id, "approved");

      // If it's a top up, add balance to user
      if (transaction.type === "topup") {
        const user = await storage.getUser(transaction.userId);
        if (user) {
          await storage.updateUserBalance(user.id, user.balance + transaction.amount);
        }
      }

      // Create notification
      await storage.createNotification({
        userId: transaction.userId,
        title: "Transaksi Disetujui",
        message: `${transaction.type === "topup" ? "Top up" : "Penarikan"} sebesar Rp ${transaction.originalAmount.toLocaleString()} telah disetujui`,
      });

      res.json({ message: "Transaksi berhasil disetujui" });
    } catch (error) {
      res.status(500).json({ message: "Terjadi kesalahan server" });
    }
  });

  app.post("/api/admin/transactions/:transactionId/reject", async (req, res) => {
    try {
      const transaction = await storage.getTransaction(req.params.transactionId);
      if (!transaction) {
        return res.status(404).json({ message: "Transaksi tidak ditemukan" });
      }

      await storage.updateTransactionStatus(transaction.id, "rejected");

      // If it's a withdrawal, return balance to user
      if (transaction.type === "withdraw") {
        const user = await storage.getUser(transaction.userId);
        if (user) {
          const returnAmount = transaction.originalAmount + transaction.adminFee;
          await storage.updateUserBalance(user.id, user.balance + returnAmount);
        }
      }

      // Create notification
      await storage.createNotification({
        userId: transaction.userId,
        title: "Transaksi Ditolak",
        message: `${transaction.type === "topup" ? "Top up" : "Penarikan"} sebesar Rp ${transaction.originalAmount.toLocaleString()} ditolak`,
      });

      res.json({ message: "Transaksi berhasil ditolak" });
    } catch (error) {
      res.status(500).json({ message: "Terjadi kesalahan server" });
    }
  });

  app.get("/api/admin/stats", async (req, res) => {
    try {
      const pendingTransactions = await storage.getPendingTransactions();
      const allUsers = await storage.getAllUsers();
      const totalVolume = await storage.getTotalVolume();

      res.json({
        pendingCount: pendingTransactions.length,
        totalUsers: allUsers.length,
        totalVolume,
      });
    } catch (error) {
      res.status(500).json({ message: "Terjadi kesalahan server" });
    }
  });

  // Notifications
  app.get("/api/notifications/:userId", async (req, res) => {
    try {
      const notifications = await storage.getUserNotifications(req.params.userId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Terjadi kesalahan server" });
    }
  });

  // Serve uploaded files
  app.use('/uploads', (await import('express')).static('uploads'));

  const httpServer = createServer(app);
  return httpServer;
}
