// routes/blogs.js
const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');

// Blog CRUD routes
router.post('/', blogController.createBlog);
router.get('/', blogController.getAllBlogs);
router.put('/:id', blogController.updateBlog);
router.delete('/:id', blogController.deleteBlog);
router.get('/slug/:slug', blogController.getBlogBySlug);

module.exports = router;