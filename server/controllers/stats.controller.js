import * as StatsService from '../services/stats.service.js';

/**
 * Lấy thống kê tổng quan của hệ thống
 */
export const getSystemStats = async (req, res) => {
  try {
    const stats = await StatsService.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
