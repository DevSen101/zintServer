// server.js
require('dotenv').config();
const connectDB = require('./config/db');
const app = require('./app');

const PORT = process.env.PORT || 5000;

// Connect DB only when NOT running tests
if (process.env.NODE_ENV !== "test") {
  connectDB();
  
  app.listen(PORT, () => {
    console.log(`✅ API running on http://localhost:${PORT}/api`);
    console.log(`✅ Auth Register: http://localhost:${PORT}/api/auth/register`);
    console.log(`✅ Auth Login: http://localhost:${PORT}/api/auth/login`);
  });
}

module.exports = app; // Export for Jest tests
