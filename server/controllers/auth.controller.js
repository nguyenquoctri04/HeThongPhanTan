import * as UserService from '../services/user.service.js';

/**
 * Đăng nhập user
 */
export const login = async (req, res) => {
  const { username, password } = req.body;

  const user = await UserService.getUserByUsername(username);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Tên đăng nhập hoặc mật khẩu không đúng"
    });
  }

  // Note: In real app, password should be hashed/compared
  if (user.password !== password) {
    return res.status(401).json({
      success: false,
      message: "Tên đăng nhập hoặc mật khẩu không đúng"
    });
  }

  const userData = user.toJSON();
  const { password: _, ...userWithoutPassword } = userData;

  res.json({
    success: true,
    message: "Đăng nhập thành công",
    data: userWithoutPassword
  });
};
