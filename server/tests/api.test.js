import request from 'supertest';
import app from '../app.js';
import sequelize from '../config/database.js';
import { User, Transaction } from '../models/index.js';

// Ensure DB is connected before tests
beforeAll(async () => {
    await sequelize.authenticate();
    // Force sync not needed if server already ran, but good for safety.
    // However, syncing might be slow.
    // Let's assume the DB is ready.
});

afterAll(async () => {
    await sequelize.close();
});

describe('API Integration Tests', () => {
    let authToken; // If we had JWT, but currently login returns user data sans token (or maybe session based?)
    // The current login returns user data. There is no token mechanism implemented in the code I saw. 
    // It's just simple password check returning JSON.
    // So for authenticated requests? The code doesn't seem to have Auth middleware checking tokens yet?
    // Let's check auth.routes.js... No middleware seen in server.js except logger.
    // Only `validateLogin` in auth routes.
    // So APIs are public?
    // `app.use("/api/users", usersRoutes);` -> Users controller doesn't seem to check auth.
    // So we don't need token.

    describe('Auth Endpoints', () => {
        it('POST /api/auth/login - should login successfully with valid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    username: 'nguyenquoctri',
                    password: '123456'
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.username).toBe('nguyenquoctri');
        });

        it('POST /api/auth/login - should fail with invalid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    username: 'nguyenquoctri',
                    password: 'wrongpassword'
                });

            expect(res.statusCode).toEqual(401);
            expect(res.body.success).toBe(false);
        });
    });

    describe('User Endpoints', () => {
        it('GET /api/users - should return list of users', async () => {
            const res = await request(app).get('/api/users');
            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBeGreaterThan(0);
        });

        it('GET /api/users?search=tri - should return filtered users', async () => {
            const res = await request(app).get('/api/users?search=tri');
            expect(res.statusCode).toEqual(200);
            // The searchUsers logic returns paginated structure OR array depending on implementation
            // In my fix: `if (result.users)...`
            // Let's check response structure
            if (res.body.pagination) {
                expect(res.body.data.length).toBeGreaterThan(0);
                expect(res.body.data[0].username).toContain('tri');
            } else {
                // If returns array
                expect(res.body.data.length).toBeGreaterThan(0);
            }
        });

        it('GET /api/users/:id - should return user details', async () => {
            // Assuming user ID 1 exists (nguyenquoctri)
            const res = await request(app).get('/api/users/1');
            expect(res.statusCode).toEqual(200);
            expect(res.body.data.id).toBe(1);
        });
    });

    describe('Transaction Endpoints', () => {
        // Need 2 users to transfer
        // User 1: nguyenquoctri
        // User 2: nguyenhuungochoang (id 2) or custom.

        it('POST /api/transactions/transfer - should transfer money successfully', async () => {
            const transferData = {
                fromUserId: 1,
                toUsername: 'nguyenhuungochoang',
                amount: 1000,
                note: 'Test transfer'
            };

            const res = await request(app)
                .post('/api/transactions/transfer')
                .send(transferData);

            if (res.statusCode !== 200) {
                console.log(res.body);
            }

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.transaction.amount).toBe(1000);
        });

        it('POST /api/transactions/transfer - should fail if balance insufficient', async () => {
            // Try to transfer a huge amount
            const transferData = {
                fromUserId: 1,
                toUsername: 'nguyenhuungochoang',
                amount: 999999999999,
                note: 'Fail transfer'
            };

            const res = await request(app)
                .post('/api/transactions/transfer')
                .send(transferData);

            expect(res.statusCode).toEqual(400); // or 500 depending on implementation
        });
    });
});
