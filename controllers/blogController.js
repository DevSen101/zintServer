// controllers/blogController.js
const Blog = require('../models/Blog');

// Create a new blog post
exports.createBlog = async (req, res) => {
  try {
    const { title, excerpt, content, author, date, readTime, image, public_id, slug, category } = req.body;

    // Validate required fields
    if (!title || !excerpt || !content || !author || !date || !readTime || !image || !slug || !category) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided' });
    }

    const blog = new Blog({
      title,
      excerpt,
      content,
      author,
      date,
      readTime,
      image,
      public_id,
      slug,
      category,
    });

    await blog.save();
    res.status(201).json({ success: true, data: blog });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update a blog post
exports.updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, excerpt, content, author, date, readTime, image, public_id, slug, category } = req.body;

    // Validate required fields
    if (!title || !excerpt || !content || !author || !date || !readTime || !image || !slug || !category) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided' });
    }

    const blog = await Blog.findByIdAndUpdate(
      id,
      { title, excerpt, content, author, date, readTime, image, public_id, slug, category },
      { new: true, runValidators: true }
    );

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }

    res.json({ success: true, data: blog });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Existing functions: getAllBlogs, deleteBlog, getBlogBySlug remain unchanged
exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.json({ success: true, data: blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findByIdAndDelete(id);

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }

    res.json({ success: true, message: 'Blog post deleted' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const blog = await Blog.findOne({ slug });
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }
    res.json({ success: true, data: blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};