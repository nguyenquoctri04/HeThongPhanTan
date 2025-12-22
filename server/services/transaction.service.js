import { Transaction, User } from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import * as UserService from './user.service.js';

export const addTransaction = async (transactionData) => {
    const t = await sequelize.transaction();

    try {
        // Validate users exist and have enough balance if needed
        // transactionData: { fromUserId, toUserId, amount, ... }

        const { fromUserId, toUserId, amount } = transactionData;

        const sender = await User.findByPk(fromUserId, { transaction: t, lock: true });
        const receiver = await User.findByPk(toUserId, { transaction: t, lock: true });

        if (!sender) throw new Error('Người gửi không tồn tại');
        if (!receiver) throw new Error('Người nhận không tồn tại');

        if (sender.balance < amount) {
            throw new Error('Số dư không đủ');
        }

        // Update balances
        await sender.update({ balance: parseFloat(sender.balance) - parseFloat(amount) }, { transaction: t });
        await receiver.update({ balance: parseFloat(receiver.balance) + parseFloat(amount) }, { transaction: t });

        // Create transaction record
        const newTransaction = await Transaction.create({
            ...transactionData,
            amount: parseFloat(amount), // ensure number
            timestamp: new Date()
        }, { transaction: t });

        await t.commit();
        return newTransaction;
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

export const getTransactions = async (userId = null, options = {}) => {
    const whereClause = {};

    if (userId) {
        const userIdNum = parseInt(userId);
        if (!isNaN(userIdNum)) {
            whereClause[Op.or] = [
                { fromUserId: userIdNum },
                { toUserId: userIdNum }
            ];
        }
    }

    const queryOptions = {
        where: whereClause,
    };

    // Sort
    let orderDirection = options.sortOrder === 'desc' ? 'DESC' : 'ASC';
    if (options.sortBy === 'amount') {
        queryOptions.order = [['amount', orderDirection]];
    } else {
        // Default sort by timestamp
        queryOptions.order = [['timestamp', orderDirection]];
    }

    // Pagination
    if (options.page && options.limit) {
        const page = parseInt(options.page) || 1;
        const limit = parseInt(options.limit) || 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await Transaction.findAndCountAll({
            ...queryOptions,
            limit,
            offset
        });

        return {
            transactions: rows,
            total: count,
            page,
            limit,
            totalPages: Math.ceil(count / limit)
        };
    }

    return await Transaction.findAll(queryOptions);
};

export const getTransactionById = async (id) => {
    return await Transaction.findByPk(id);
};
