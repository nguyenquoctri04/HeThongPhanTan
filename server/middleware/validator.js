// Validation middleware

export const validateLogin = (req, res, next) => {
  const { username, password } = req.body;
  
  if (!username || typeof username !== 'string' || username.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Tên đăng nhập không hợp lệ'
    });
  }
  
  if (!password || typeof password !== 'string' || password.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Mật khẩu không hợp lệ'
    });
  }
  
  // Trim username
  req.body.username = username.trim();
  
  next();
};

export const validateTransfer = (req, res, next) => {
  const { fromUserId, toUsername, amount, note } = req.body;
  
  // Validate fromUserId
  if (!fromUserId || isNaN(fromUserId) || parseInt(fromUserId) <= 0) {
    return res.status(400).json({
      success: false,
      message: 'ID người gửi không hợp lệ'
    });
  }
  
  // Validate toUsername
  if (!toUsername || typeof toUsername !== 'string' || toUsername.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Tên người nhận không hợp lệ'
    });
  }
  
  // Validate amount
  const transferAmount = parseFloat(amount);
  if (isNaN(transferAmount) || transferAmount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Số tiền phải là số dương và lớn hơn 0'
    });
  }
  
  // Validate note length
  if (note && note.length > 500) {
    return res.status(400).json({
      success: false,
      message: 'Nội dung ghi chú không được vượt quá 500 ký tự'
    });
  }
  
  // Normalize data
  req.body.fromUserId = parseInt(fromUserId);
  req.body.toUsername = toUsername.trim();
  req.body.amount = transferAmount;
  req.body.note = note ? note.trim() : '';
  
  next();
};

export const validateUserId = (req, res, next) => {
  const { id } = req.params;
  
  if (!id || isNaN(id) || parseInt(id) <= 0) {
    return res.status(400).json({
      success: false,
      message: 'ID người dùng không hợp lệ'
    });
  }
  
  req.params.id = parseInt(id);
  next();
};

export const validateQueryParams = (req, res, next) => {
  // Validate pagination
  if (req.query.page) {
    const page = parseInt(req.query.page);
    if (isNaN(page) || page < 1) {
      return res.status(400).json({
        success: false,
        message: 'Trang không hợp lệ (phải >= 1)'
      });
    }
    req.query.page = page;
  }
  
  if (req.query.limit) {
    const limit = parseInt(req.query.limit);
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: 'Số lượng mỗi trang không hợp lệ (phải từ 1 đến 100)'
      });
    }
    req.query.limit = limit;
  }
  
  // Validate sort order
  if (req.query.sortOrder && !['asc', 'desc'].includes(req.query.sortOrder.toLowerCase())) {
    return res.status(400).json({
      success: false,
      message: 'Thứ tự sắp xếp không hợp lệ (phải là asc hoặc desc)'
    });
  }
  
  next();
};
