// Global error handler middleware
export const errorHandler = (err, req, res, next) => {
  const timestamp = new Date().toISOString();
  
  // Log error
  console.error(`[${timestamp}] ERROR:`, err);
  
  // Determine status code
  const statusCode = err.statusCode || err.status || 500;
  
  // Determine error message
  const message = err.message || 'Đã xảy ra lỗi không xác định';
  
  // Send error response
  res.status(statusCode).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Async error wrapper
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
