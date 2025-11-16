import {
  getUserById,
  getUserByUsername,
  updateUserBalance,
  addTransaction,
  getTransactions,
  getTransactionById,
  generateTransaction
} from '../mockData.js';

/**
 * Chuyển tiền giữa các users
 */
export const transferMoney = async (req, res) => {
  const { fromUserId, toUsername, amount, note } = req.body;
  
  const fromUser = getUserById(fromUserId);
  if (!fromUser) {
    return res.status(404).json({
      success: false,
      message: "Không tìm thấy người gửi"
    });
  }
  
  const toUser = getUserByUsername(toUsername);
  if (!toUser) {
    return res.status(404).json({
      success: false,
      message: "Không tìm thấy người nhận"
    });
  }
  
  if (fromUser.id === toUser.id) {
    return res.status(400).json({
      success: false,
      message: "Không thể chuyển tiền cho chính mình"
    });
  }
  
  if (fromUser.balance < amount) {
    return res.status(400).json({
      success: false,
      message: `Số dư không đủ. Số dư hiện tại: ${fromUser.balance.toLocaleString('vi-VN')} VNĐ`
    });
  }
  
  // Transaction-like operation (atomic)
  try {
    // Update balances
    updateUserBalance(fromUser.id, fromUser.balance - amount);
    updateUserBalance(toUser.id, toUser.balance + amount);
    
    // Create transaction record
    const transaction = generateTransaction(fromUser, toUser, amount, note);
    addTransaction(transaction);
    
    // Get updated user
    const updatedFromUser = getUserById(fromUser.id);
    const { password, ...userWithoutPassword } = updatedFromUser;
    
    res.json({
      success: true,
      message: "Chuyển tiền thành công",
      data: {
        transaction,
        user: userWithoutPassword
      }
    });
  } catch (error) {
    throw new Error(`Lỗi khi xử lý giao dịch: ${error.message}`);
  }
};

/**
 * Lấy danh sách transactions
 */
export const getTransactionsList = async (req, res) => {
  const { userId, page, limit, sortBy, sortOrder } = req.query;
  
  const options = {
    page: page ? parseInt(page) : null,
    limit: limit ? parseInt(limit) : null,
    sortBy: sortBy || 'timestamp',
    sortOrder: sortOrder || 'desc'
  };
  
  const result = getTransactions(userId ? parseInt(userId) : null, options);
  
  if (options.page && options.limit) {
    return res.json({
      success: true,
      data: result.transactions,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages
      }
    });
  }
  
  res.json({
    success: true,
    data: result,
    total: Array.isArray(result) ? result.length : result.total || 0
  });
};

/**
 * Lấy transaction theo ID
 */
export const getTransaction = async (req, res) => {
  const transactionId = req.params.id;
  const transaction = getTransactionById(transactionId);
  
  if (!transaction) {
    return res.status(404).json({
      success: false,
      message: "Không tìm thấy giao dịch"
    });
  }
  
  res.json({
    success: true,
    data: transaction
  });
};
