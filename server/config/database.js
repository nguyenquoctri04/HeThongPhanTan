import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
// Load .env
dotenv.config({
    path: path.resolve(__dirname, '../.env'),
});

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false, // Set to console.log to see SQL queries
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false // Required for Supabase/Heroku usually
        }
    }
});

export const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Kết nối Database thành công!');
    } catch (error) {
        console.error('❌ Không thể kết nối Database:', error);
        process.exit(1);
    }
};

export default sequelize;
