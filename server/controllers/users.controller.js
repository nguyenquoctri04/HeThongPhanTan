import * as UserService from '../services/user.service.js';

/**
 * Lấy danh sách users với pagination, search, sort
 */
export const getUsersList = async (req, res) => {
  const { page, limit, search, sortBy, sortOrder } = req.query;

  const options = {
    page: page ? parseInt(page) : null,
    limit: limit ? parseInt(limit) : null,
    sortBy: sortBy,
    sortOrder: sortOrder || 'asc'
  };

  try {
    const result = await UserService.searchUsers(search, options);

    // Check if result is paginated object or array
    if (result.users && result.pagination === undefined) {
      // Service returns { users, total, page, limit, totalPages } when paginated
      return res.json({
        success: true,
        data: result.users,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages
        }
      });
    }

    // If search users returns the standardized structure directly or array
    if (Array.isArray(result)) {
      return res.json({
        success: true,
        data: result,
        total: result.length
      });
    }

    // Use service's return structure directly if it matches what we want
    if (result.users) {
      return res.json({
        success: true,
        data: result.users,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages
        }
      });
    }

    // Fallback
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
 * Lấy user theo ID
 */
export const getUser = async (req, res) => {
  const userId = req.params.id;
  const user = await UserService.getUserById(userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "Không tìm thấy người dùng"
    });
  }

  const userData = user.toJSON();
  const { password, ...userWithoutPassword } = userData;
  res.json({
    success: true,
    data: userWithoutPassword
  });
};
