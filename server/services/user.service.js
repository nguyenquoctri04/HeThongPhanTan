import { User } from '../models/index.js';
import { Op } from 'sequelize';

export const getUsers = async () => {
    return await User.findAll({
        order: [['id', 'ASC']]
    });
};

export const getUserById = async (id) => {
    if (!id || isNaN(id)) return null;
    return await User.findByPk(parseInt(id));
};

export const getUserByUsername = async (username) => {
    if (!username) return null;
    // Case insensitive search using ILIKE for Postgres
    // or just assume standard login
    return await User.findOne({
        where: {
            username: username
        }
    });
};

export const createUser = async (userData) => {
    return await User.create(userData);
};

export const updateUserBalance = async (userId, newBalance, transaction = null) => {
    if (!userId) throw new Error('Invalid user ID');

    // update returns [affectedCount]
    const [affectedCount] = await User.update(
        { balance: newBalance },
        {
            where: { id: userId },
            transaction: transaction
        }
    );

    if (affectedCount === 0) {
        throw new Error('User not found or balance not updated');
    }

    return await getUserById(userId);
};

export const searchUsers = async (query, options = {}) => {
    // If query is provided, add where clause. Otherwise, return all (with pagination/sort).
    const queryOptions = {};

    if (query && typeof query === 'string' && query.trim()) {
        const searchTerm = query.trim();
        queryOptions.where = {
            [Op.or]: [
                { name: { [Op.iLike]: `%${searchTerm}%` } },
                { username: { [Op.iLike]: `%${searchTerm}%` } }
            ]
        };
    }

    // Sort options
    if (options.sortBy) {
        let order = options.sortOrder === 'desc' ? 'DESC' : 'ASC';
        if (options.sortBy === 'name') {
            queryOptions.order = [['name', order]];
        } else if (options.sortBy === 'balance') {
            queryOptions.order = [['balance', order]];
        }
    }

    // Pagination
    if (options.page && options.limit) {
        const page = parseInt(options.page) || 1;
        const limit = parseInt(options.limit) || 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await User.findAndCountAll({
            ...queryOptions,
            limit,
            offset
        });

        return {
            users: rows,
            total: count,
            page,
            limit,
            totalPages: Math.ceil(count / limit)
        };
    }

    return await User.findAll(queryOptions);
};

export const getAllUsersCount = async () => {
    return await User.count();
};

export const bulkCreateUsers = async (users) => {
    return await User.bulkCreate(users, { ignoreDuplicates: true });
};
