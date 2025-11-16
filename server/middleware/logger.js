// Request logging middleware
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  
  // Log request
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  
  // Log request body (except sensitive data)
  if (req.method === 'POST' || req.method === 'PUT') {
    const body = { ...req.body };
    if (body.password) {
      body.password = '***';
    }
    if (Object.keys(body).length > 0) {
      console.log(`  Body:`, JSON.stringify(body, null, 2));
    }
  }
  
  // Log response
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  
  next();
};

// Error logging
export const errorLogger = (err, req, res, next) => {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ERROR:`, err.message);
  console.error(err.stack);
  next(err);
};
