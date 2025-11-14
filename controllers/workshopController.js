// controllers/workshopController.js
const Workshop = require('../models/Workshop');
const mongoose = require('mongoose');

// Helper to generate slug
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/gi, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// Helper to validate required fields
const validateWorkshopFields = (body, isUpdate = false) => {
  const { title, instructor, duration, date, description, image, category } = body;
  
  if (!title || !instructor || !duration || !date || !description || !category) {
    return false;
  }
  
  if (!isUpdate && !image) {
    return false;
  }
  
  return true;
};

// Cloudinary delete helper (adjust endpoint as needed)
const deleteImageFromCloudinary = async (public_id, imageUrl) => {
  if (!public_id && !imageUrl) return;

  try {
    const res = await fetch(
      `${process.env.SERVER_URL.replace(/\/$/, '')}/upload/delete-by-url`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: imageUrl }),
      }
    );
    if (!res.ok) console.warn('Cloudinary delete failed:', await res.text());
  } catch (err) {
    console.warn('Cloudinary delete error:', err.message);
  }
};

// Create a new workshop
exports.createWorkshop = async (req, res) => {
  try {
    if (!validateWorkshopFields(req.body, false)) {
      return res.status(400).json({ 
        success: false, 
        message: 'All required fields must be provided' 
      });
    }

    const { title, instructor, duration, date, description, image, public_id, category,zoomLink, slug } = req.body;
    const workshopSlug = slug || generateSlug(title);

    const workshop = new Workshop({
      title,
      instructor,
      duration,
      date,
      description,
      image,
      public_id,
      slug: workshopSlug,
      zoomLink,
      category,
    });

    await workshop.save();
    res.status(201).json({ success: true, data: workshop });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'A workshop with this title already exists.' 
      });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all workshops
exports.getAllWorkshops = async (req, res) => {
  try {
    const workshops = await Workshop.find().sort({ date: 1 });
    res.json({ success: true, data: workshops });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get workshop by ID
exports.getWorkshopById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid workshop ID' });
    }

    const workshop = await Workshop.findById(id);
    if (!workshop) {
      return res.status(404).json({ success: false, message: 'Workshop not found' });
    }

    res.json({ success: true, data: workshop });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a workshop
exports.updateWorkshop = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid workshop ID' });
    }

    const requiredFields = ['title', 'instructor', 'duration', 'date', 'description','zoomLink', 'category'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }

    // Find existing workshop to get current image
    const existingWorkshop = await Workshop.findById(id);
    if (!existingWorkshop) {
      return res.status(404).json({ success: false, message: 'Workshop not found' });
    }

    const updateData = { ...req.body };

    // Regenerate slug only if title changed and no slug provided
    if (updateData.title && updateData.title !== existingWorkshop.title) {
      updateData.slug = updateData.slug || generateSlug(updateData.title);
    }

    // If new image is provided, delete old one from Cloudinary
    if (updateData.image && updateData.image !== existingWorkshop.image) {
      await deleteImageFromCloudinary(existingWorkshop.public_id, existingWorkshop.image);
    }

    // Use findByIdAndUpdate with runValidators to enforce schema rules
    const workshop = await Workshop.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true,
        runValidators: true,
      }
    );

    if (!workshop) {
      return res.status(404).json({ success: false, message: 'Workshop not found' });
    }

    res.json({ success: true, data: workshop });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'A workshop with this title/slug already exists.' 
      });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete a workshop
exports.deleteWorkshop = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid workshop ID' });
    }

    const workshop = await Workshop.findByIdAndDelete(id);
    if (!workshop) {
      return res.status(404).json({ success: false, message: 'Workshop not found' });
    }

    // Delete associated image from Cloudinary
    await deleteImageFromCloudinary(workshop.public_id, workshop.image);

    res.json({ success: true, message: 'Workshop deleted' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get workshop by slug
exports.getWorkshopBySlug = async (req, res) => {
  try {
    const { _id } = req.params;
    // console.log("data",req.params)

     // Validate ObjectId (optional but recommended) 
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }

    const workshop = await Workshop.findById(_id); 
    
    if (!workshop) {
      return res.status(404).json({ success: false, message: 'Workshop not found' });
    }
    
    res.json({ success: true, data: workshop });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};