// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
    console.error("Unhandled error:", err);
  
    // Default to 500 if no status
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
  
    res.status(statusCode).json({
      success: false,
      error: message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  };
  
  module.exports = errorHandler;