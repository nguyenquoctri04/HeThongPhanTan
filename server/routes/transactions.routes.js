import express from 'express';
import {
  transferMoney,
  getTransactionsList,
  getTransaction
} from '../controllers/transactions.controller.js';
import { validateTransfer, validateQueryParams } from '../middleware/validator.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

/**
 * @route   POST /api/transactions/transfer
 * @desc    Chuyển tiền giữa các users
 * @access  Public
 */
router.post('/transfer', validateTransfer, asyncHandler(transferMoney));

/**
 * @route   GET /api/transactions
 * @desc    Lấy danh sách transactions (có pagination, filter, sort)
 * @access  Public
 */
router.get('/', validateQueryParams, asyncHandler(getTransactionsList));

/**
 * @route   GET /api/transactions/:id
 * @desc    Lấy transaction theo ID
 * @access  Public
 */
router.get('/:id', asyncHandler(getTransaction));

export default router;
