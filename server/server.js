import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';
import { connectDB } from "./config/database.js";
import sequelize from "./config/database.js";
import { MOCK_USERS } from "./mockData.js";
import * as UserService from "./services/user.service.js";
import app from "./app.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
dotenv.config({
  path: path.resolve(__dirname, '.env'),
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'development';

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
      // Seed with fixed IDs from MOCK_USERS
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
