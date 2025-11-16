import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MOCK_USERS } from "./mockData.js";

// Routes
import authRoutes from "./routes/auth.routes.js";
import usersRoutes from "./routes/users.routes.js";
import transactionsRoutes from "./routes/transactions.routes.js";
import statsRoutes from "./routes/stats.routes.js";

// Middleware
import { requestLogger, errorLogger } from "./middleware/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
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

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
  console.log(`📊 Tổng số users: ${MOCK_USERS.length}`);
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

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n⚠️  SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n⚠️  SIGINT signal received: closing HTTP server');
  process.exit(0);
});