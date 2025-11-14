// server.js
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser'); // Add this
require('dotenv').config();

const authRoutes = require('./routes/auth'); // Add auth routes
const courseRoutes = require('./routes/courseRoutes');
const courseDetailRoutes = require("./routes/courseDetailRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const categoriesRouter = require('./routes/categories');
const coursePage2Routes = require('./routes/coursePage2Routes');
const filterRouter = require('./routes/filterRouter');
const teacherRoutes = require('./routes/teacherRoutes');
const directorRoutes = require('./routes/director');
const dashboardCourseRoutes = require('./routes/dashboardCourseRoutes');
const studentReviewRoutes = require('./routes/studentReviewRoutes');
const blogsRouter = require('./routes/blogs');
const workshopsRouter = require('./routes/workshops');
const connectDB = require('./config/db');

if (process.env.NODE_ENV !== "test") {
  connectDB(); // Only connect for normal run, not tests
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:8080','http://localhost:5173','http://localhost:8081'],
  credentials: true, // Allow cookies
}));
app.use(express.json())
app.use(cookieParser())

// Connect to database
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use("/api/course-details", courseDetailRoutes);
app.use("/api/upload", uploadRoutes);
app.use('/api/categories', categoriesRouter);
app.use('/api/course-page-2', coursePage2Routes); 
app.use('/api/filter', filterRouter); 
app.use('/api/teachers', teacherRoutes);
app.use('/api/director', directorRoutes);
app.use('/api/dashboard-courses', dashboardCourseRoutes);
app.use('/api/student-reviews', studentReviewRoutes);
app.use('/api/blogs', blogsRouter);
app.use('/api/workshops', workshopsRouter);

// Health check route 
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Global error handler (optional but recommended)
app.use((err, req, res, next) => {
    console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`✅ API running on http://localhost:${PORT}/api`);
  console.log(`✅ Auth endpoints: http://localhost:${PORT}/api/auth/register`);
  console.log(`✅ Auth endpoints: http://localhost:${PORT}/api/auth/login`);
});