// controllers/categoryController.js
const Category = require('../models/Category');

// GET categories
const getCategories = async (req, res) => {
  console.log("📥 GET request received");
  try {
    const doc = await Category.findOne();
    console.log("🔍 Found document:", doc);
    
    res.json(doc ? doc.data : {});
  } catch (err) {
    console.error("💥 GET error:", err);
    res.status(500).json({ error: 'Load failed', details: err.message });
  }
};

// POST/UPDATE categories
const saveCategories = async (req, res) => {
  console.log("📥 POST Body received:", JSON.stringify(req.body, null, 2));

  // Validate request body
  if (!req.body || Object.keys(req.body).length === 0) {
    console.log("❌ Empty body received");
    return res.status(400).json({ error: 'Empty body - no data to save' });
  }

  try {
    // Find existing document
    let doc = await Category.findOne();
    console.log("🔍 Existing doc:", doc ? "Found" : "Not found");

    if (doc) {
      // Update existing document
      doc.data = req.body;
      doc.markModified('data')
      await doc.save();
      console.log("💾 Updated document successfully");
      console.log("📄 Saved data:", JSON.stringify(doc.data, null, 2));
    } else {
      // Create new document
      doc = await Category.create({ data: req.body });
      console.log("🆕 Created new document successfully");
      console.log("📄 Saved data:", JSON.stringify(doc.data, null, 2));
    }

    res.json({ success: true, message: 'Data saved successfully', data: doc.data });
  } catch (error) {
    console.error("💥 Save error:", error);
    res.status(500).json({ 
      error: 'Save failed', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Export functions
module.exports = {
  getCategories,
  saveCategories
};