import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';

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

// Load .env
dotenv.config({
    path: path.resolve(__dirname, '.env'),
});

const app = express();
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging (development only)
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

export default app;
