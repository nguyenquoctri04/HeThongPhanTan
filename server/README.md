# Hệ Thống Phân Tán - Backend API

Backend API server cho hệ thống chuyển tiền với mock data.

## Cấu trúc dự án

```
server/
├── server.js                    # Entry point - Main server file
├── mockData.js                  # Data layer - Mock data và database functions
│
├── routes/                      # Route definitions
│   ├── auth.routes.js          # Authentication routes
│   ├── users.routes.js         # User routes
│   ├── transactions.routes.js  # Transaction routes
│   └── stats.routes.js         # Statistics routes
│
├── controllers/                 # Business logic
│   ├── auth.controller.js      # Authentication logic
│   ├── users.controller.js     # User operations
│   ├── transactions.controller.js # Transaction operations
│   └── stats.controller.js     # Statistics logic
│
├── middleware/                  # Middleware functions
│   ├── logger.js               # Request logging
│   ├── validator.js            # Input validation
│   └── errorHandler.js         # Error handling
│
└── package.json
```

## Kiến trúc

- **server.js**: Entry point, cấu hình Express và kết nối routes
- **routes/**: Định nghĩa các API endpoints và middleware cụ thể
- **controllers/**: Xử lý business logic, gọi data layer
- **middleware/**: Các middleware dùng chung (validation, logging, error handling)
- **mockData.js**: Data layer, quản lý mock data như database

## Cài đặt

```bash
npm install
```

## Chạy Server

### Development mode (với auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

Server sẽ chạy tại `http://localhost:5000` (hoặc port được cấu hình trong file `.env`)

## API Endpoints

### 1. Health Check
```
GET /
```
Trả về thông tin server và trạng thái.

### 2. Authentication

#### Đăng nhập
```
POST /api/auth/login
Body: {
  "username": "nguyenquoctri",
  "password": "123456"
}
```

### 3. Users

#### Lấy danh sách users
```
GET /api/users
Query params:
  - page: số trang (optional)
  - limit: số lượng mỗi trang (optional, max 100)
  - search: tìm kiếm theo tên/username (optional)
  - sortBy: sắp xếp theo "name" hoặc "balance" (optional)
  - sortOrder: "asc" hoặc "desc" (optional)
```

#### Lấy user theo ID
```
GET /api/users/:id
```

### 4. Transactions

#### Chuyển tiền
```
POST /api/transactions/transfer
Body: {
  "fromUserId": 1,
  "toUsername": "nguyenhuungochoang",
  "amount": 100000,
  "note": "Thanh toán hóa đơn" (optional)
}
```

#### Lấy danh sách transactions
```
GET /api/transactions
Query params:
  - userId: lọc theo user ID (optional)
  - page: số trang (optional)
  - limit: số lượng mỗi trang (optional)
  - sortBy: "amount" hoặc "timestamp" (optional)
  - sortOrder: "asc" hoặc "desc" (optional)
```

#### Lấy transaction theo ID
```
GET /api/transactions/:id
```

### 5. Statistics
```
GET /api/stats
```
Trả về thống kê tổng quan của hệ thống.

## Response Format

Tất cả API responses đều có format:
```json
{
  "success": true/false,
  "message": "Mô tả (nếu có)",
  "data": {...},
  "pagination": {...} // Nếu có phân trang
}
```

## Error Handling

Server tự động xử lý lỗi và trả về format chuẩn:
```json
{
  "success": false,
  "message": "Mô tả lỗi"
}
```

## Mock Data

- **105 users** với dữ liệu giả
- **Tất cả password**: `123456`
- Dữ liệu được lưu trong memory, sẽ reset khi restart server

## Environment Variables

Tạo file `.env` trong thư mục `server/`:

```env
PORT=5000
NODE_ENV=development
```

## Lợi ích của cấu trúc này

✅ **Dễ quản lý**: Mỗi chức năng trong file riêng  
✅ **Dễ maintain**: Tìm và sửa bug nhanh hơn  
✅ **Dễ test**: Có thể test từng controller riêng  
✅ **Dễ mở rộng**: Thêm tính năng mới không ảnh hưởng code cũ  
✅ **Code organization**: Tuân theo nguyên tắc separation of concerns  
✅ **Reusability**: Controllers và middleware có thể tái sử dụng  

## Tính năng

✅ CRUD operations cho Users  
✅ Transaction management  
✅ Input validation  
✅ Error handling  
✅ Request logging  
✅ Pagination support  
✅ Search functionality  
✅ Sorting options  
✅ Statistics API  
✅ Graceful shutdown  

## Lưu ý

- Đây là mock server, dữ liệu không được lưu vĩnh viễn
- Tất cả dữ liệu sẽ reset khi restart server
- Phù hợp cho development và testing