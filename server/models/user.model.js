import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    balance: {
        type: DataTypes.DECIMAL(20, 0), // Dùng Decimal cho tiền, scale 0 vì tiền VNĐ không có số lẻ
        defaultValue: 0,
        get() {
            const value = this.getDataValue('balance');
            return value === null ? null : parseFloat(value);
        }
    }
}, {
    timestamps: true,
    tableName: 'users'
});

export default User;
