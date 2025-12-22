import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Transaction = sequelize.define('Transaction', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    fromUserId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    fromUsername: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fromName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    toUserId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    toUsername: {
        type: DataTypes.STRING,
        allowNull: false
    },
    toName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(20, 0),
        allowNull: false,
        get() {
            const value = this.getDataValue('amount');
            return value === null ? null : parseFloat(value);
        }
    },
    note: {
        type: DataTypes.STRING,
        defaultValue: 'Chuyển tiền'
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'completed'
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    timestamps: true,
    tableName: 'transactions'
});

export default Transaction;
