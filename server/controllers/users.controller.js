import { getUsers, getUserById, searchUsers } from '../mockData.js';

/**
 * Lấy danh sách users với pagination, search, sort
 */
export const getUsersList = async (req, res) => {
  const { page, limit, search, sortBy, sortOrder } = req.query;
  
  // Search users if query provided
  if (search) {
    const result = searchUsers(search, { page, limit, sortBy, sortOrder: sortOrder || 'asc' });
    
    if (page && limit) {
      return res.json({
        success: true,
        data: result.users || result,
        pagination: {
          page: result.page || 1,
          limit: result.limit || result.length,
          total: result.total || result.length,
          totalPages: result.totalPages || 1
        }
      });
    }
    
    return res.json({
      success: true,
      data: result,
      total: Array.isArray(result) ? result.length : result.total || 0
    });
  }
  
  // Get all users with pagination
  let users = getUsers().map(({ password, ...user }) => user);
  
  // Sort
  if (sortBy === 'name') {
    users.sort((a, b) => {
      const order = sortOrder === 'desc' ? -1 : 1;
      return a.name.localeCompare(b.name) * order;
    });
  } else if (sortBy === 'balance') {
    users.sort((a, b) => {
      const order = sortOrder === 'desc' ? -1 : 1;
      return (a.balance - b.balance) * order;
    });
  }
  
  // Pagination
  if (page && limit) {
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedUsers = users.slice(startIndex, endIndex);
    
    return res.json({
      success: true,
      data: paginatedUsers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: users.length,
        totalPages: Math.ceil(users.length / limitNum)
      }
    });
  }
  
  res.json({
    success: true,
    data: users,
    total: users.length
  });
};

/**
 * Lấy user theo ID
 */
export const getUser = async (req, res) => {
  const userId = req.params.id;
  const user = getUserById(userId);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "Không tìm thấy người dùng"
    });
  }
  
  const { password, ...userWithoutPassword } = user;
  res.json({
    success: true,
    data: userWithoutPassword
  });
};
