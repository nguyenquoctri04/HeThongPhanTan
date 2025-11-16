import { getUserByUsername } from '../mockData.js';

/**
 * Đăng nhập user
 */
export const login = async (req, res) => {
  const { username, password } = req.body;
  
  const user = getUserByUsername(username);
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Tên đăng nhập hoặc mật khẩu không đúng"
    });
  }
  
  if (user.password !== password) {
    return res.status(401).json({
      success: false,
      message: "Tên đăng nhập hoặc mật khẩu không đúng"
    });
  }
  
  const { password: _, ...userWithoutPassword } = user;
  res.json({
    success: true,
    message: "Đăng nhập thành công",
    data: userWithoutPassword
  });
};
