import express from 'express';
import { getUsersList, getUser } from '../controllers/users.controller.js';
import { validateUserId, validateQueryParams } from '../middleware/validator.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

/**
 * @route   GET /api/users
 * @desc    Lấy danh sách users (có pagination, search, sort)
 * @access  Public
 */
router.get('/', validateQueryParams, asyncHandler(getUsersList));

/**
 * @route   GET /api/users/:id
 * @desc    Lấy user theo ID
 * @access  Public
 */
router.get('/:id', validateUserId, asyncHandler(getUser));

export default router;
