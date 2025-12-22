import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';
import { connectDB } from "./config/database.js";
import sequelize from "./config/database.js";
import { User } from "./models/index.js";
import { MOCK_USERS } from "./mockData.js";
import * as UserService from "./services/user.service.js";

// Routes
import authRoutes from "./routes/auth.routes.js";
import usersRoutes from "./routes/users.routes.js";
import transactionsRoutes from "./routes/transactions.routes.js";
import statsRoutes from "./routes/stats.routes.js";

// Middleware
import { requestLogger, errorLogger } from "./middleware/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Load .env ở ROOT
// Load .env
dotenv.config({
  path: path.resolve(__dirname, '.env'),
});

const app = express();
const PORT = process.env.PORT || 5000;
console.log("PORT:", PORT);
const HOST = process.env.HOST || '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging (chỉ trong development)
if (NODE_ENV === 'development') {
  app.use(requestLogger);
}

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Hệ thống phân tán API đang chạy!",
    version: "1.0.0",
    environment: NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/transactions", transactionsRoutes);
app.use("/api/stats", statsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} không tồn tại`
  });
});

// Error handling middleware (must be last)
app.use(errorLogger);
app.use(errorHandler);

// Database Initialization and Server Start
const startServer = async () => {
  try {
    // 1. Connect Database
    await connectDB();

    // 2. Sync Models (alter: true updates schema if changed)
    await sequelize.sync({ alter: true });
    console.log('✅ Database Schema Synced');

    // 3. Seed Data if empty
    const userCount = await UserService.getAllUsersCount();
    if (userCount === 0) {
      console.log('🌱 Seeding initial data...');
      const usersToSeed = MOCK_USERS.map(({ id, ...user }) => user); // remove id to let DB auto-increment or keep it? 
      // Better to let DB handle IDs if we switched to Serial, but MOCK has fixed IDs. 
      // Since we defined ID as autoIncrement, we can skip passing ID or force it if we want to preserve mock IDs.
      // Let's try to preserve mock IDs for consistency if possible, but simplest is to let DB handle it.
      // However, Transaction logs in Mock rely on IDs.
      // Let's seed with IDs included if possible.
      await UserService.bulkCreateUsers(MOCK_USERS);
      console.log(`✅ Seeded ${MOCK_USERS.length} users`);
    }

    // 4. Start Server
    app.listen(PORT, HOST, () => {
      console.log('='.repeat(50));
      console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${NODE_ENV}`);
      console.log(`⏰ Thời gian khởi động: ${new Date().toLocaleString('vi-VN')}`);
      console.log('='.repeat(50));

      if (NODE_ENV === 'development') {
        console.log('\n📝 API Endpoints:');
        console.log('  GET  /                    - Health check');
        console.log('  GET  /api/stats           - Statistics');
        console.log('  GET  /api/users           - List all users');
        console.log('  GET  /api/users/:id       - Get user by ID');
        console.log('  POST /api/auth/login      - Login');
        console.log('  POST /api/transactions/transfer - Transfer money');
        console.log('  GET  /api/transactions    - Get transactions');
        console.log('  GET  /api/transactions/:id - Get transaction by ID');
        console.log('');
      }
    });

  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n⚠️  SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n⚠️  SIGINT signal received: closing HTTP server');
  process.exit(0);
});
