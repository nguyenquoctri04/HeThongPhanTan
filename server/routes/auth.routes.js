import express from 'express';
import { login } from '../controllers/auth.controller.js';
import { validateLogin } from '../middleware/validator.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

/**
 * @route   POST /api/auth/login
 * @desc    Đăng nhập user
 * @access  Public
 */
router.post('/login', validateLogin, asyncHandler(login));

export default router;
