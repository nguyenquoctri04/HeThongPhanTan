import { getStats } from '../mockData.js';

/**
 * Lấy thống kê tổng quan của hệ thống
 */
export const getSystemStats = async (req, res) => {
  const stats = getStats();
  res.json({
    success: true,
    data: stats
  });
};
