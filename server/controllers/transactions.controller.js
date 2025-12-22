import * as UserService from '../services/user.service.js';
import * as TransactionService from '../services/transaction.service.js';

/**
 * Chuyển tiền giữa các users
 */
export const transferMoney = async (req, res) => {
  const { fromUserId, toUsername, amount, note } = req.body;

  try {
    const fromUser = await UserService.getUserById(fromUserId);
    if (!fromUser) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người gửi"
      });
    }

    const toUser = await UserService.getUserByUsername(toUsername);
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

    // Create transaction via service (handles validation and db transaction)
    const transaction = await TransactionService.addTransaction({
      fromUserId: fromUser.id,
      fromUsername: fromUser.username,
      fromName: fromUser.name,
      toUserId: toUser.id,
      toUsername: toUser.username,
      toName: toUser.name,
      amount: parseFloat(amount),
      note
    });

    const updatedFromUser = await UserService.getUserById(fromUser.id);
    const userData = updatedFromUser.toJSON();
    const { password, ...userWithoutPassword } = userData;

    res.json({
      success: true,
      message: "Chuyển tiền thành công",
      data: {
        transaction,
        user: userWithoutPassword
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      message: error.message || "Lỗi khi xử lý giao dịch"
    });
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

  try {
    const result = await TransactionService.getTransactions(userId, options);

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
      total: Array.isArray(result) ? result.length : 0
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Lấy transaction theo ID
 */
export const getTransaction = async (req, res) => {
  const transactionId = req.params.id;
  try {
    const transaction = await TransactionService.getTransactionById(transactionId);

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
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
