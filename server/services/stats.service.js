import { User, Transaction } from '../models/index.js';
import sequelize from '../config/database.js';

export const getStats = async () => {
    const totalUsers = await User.count();

    // Use sum aggregate
    const totalBalanceResult = await User.sum('balance');
    const totalBalance = totalBalanceResult || 0;

    const avgBalance = totalUsers > 0 ? totalBalance / totalUsers : 0;

    const totalTransactions = await Transaction.count();

    const totalTransactionAmountResult = await Transaction.sum('amount');
    const totalTransactionAmount = totalTransactionAmountResult || 0;

    return {
        totalUsers,
        totalBalance,
        avgBalance,
        totalTransactions,
        totalTransactionAmount
    };
};
