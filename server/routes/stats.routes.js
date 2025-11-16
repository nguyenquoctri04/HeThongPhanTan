import express from 'express';
import { getSystemStats } from '../controllers/stats.controller.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

/**
 * @route   GET /api/stats
 * @desc    Lấy thống kê tổng quan hệ thống
 * @access  Public
 */
router.get('/', asyncHandler(getSystemStats));

export default router;
