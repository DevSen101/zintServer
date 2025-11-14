const CourseDetail = require("../models/CourseDetail");

// Create a new course detail (only if it doesn't exist)
exports.createCourseDetail = async (req, res) => {
  try {
    const { courseId } = req.body;
    if (!courseId || typeof courseId !== "string" || courseId.trim() === "") {
      return res.status(400).json({ 
        success: false, 
        message: "Valid 'courseId' (non-empty string) is required in request body" 
      });
    }

    const existing = await CourseDetail.findOne({ courseId: courseId.trim() });
    if (existing) {
      return res.status(409).json({ 
        success: false, 
        message: "Course detail already exists for this courseId" 
      });
    }

    // Trim courseId to avoid whitespace issues
    const courseData = { ...req.body, courseId: courseId.trim() };
    const detail = new CourseDetail(courseData);
    await detail.save();

    res.status(201).json({ success: true, data: detail });
  } catch (error) {
    console.error("Create CourseDetail Error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ 
        success: false, 
        message: "Validation Error", 
        details: Object.values(error.errors).map(e => e.message) 
      });
    }
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Update an existing course detail
exports.updateCourseDetail = async (req, res) => {
  try {
    const { courseId } = req.params;
    if (!courseId || typeof courseId !== "string" || courseId.trim() === "") {
      return res.status(400).json({ 
        success: false, 
        message: "Valid 'courseId' (non-empty string) is required in URL" 
      });
    }

    const detail = await CourseDetail.findOneAndUpdate(
      { courseId: courseId.trim() },
      req.body,
      { 
        new: true, 
        runValidators: true,     // ✅ Enforce schema validation on update
        context: 'query'         // Ensures `this` refers to the document in custom validators (if any)
      }
    );

    if (!detail) {
      return res.status(404).json({ 
        success: false, 
        message: "Course detail not found" 
      });
    }

    res.status(200).json({ success: true, data: detail });
  } catch (error) {
    console.error("Update CourseDetail Error:", error); 
    if (error.name === "ValidationError") {
      return res.status(400).json({ 
        success: false, 
        message: "Validation Error", 
        details: Object.values(error.errors).map(e => e.message) 
      });
    }
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get a single course detail
exports.getCourseDetail = async (req, res) => {
  try {
    const { courseId } = req.params;
    if (!courseId) {
      return res.status(400).json({ success: false, message: "courseId is required" });
    }

    const detail = await CourseDetail.findOne({ courseId: courseId.trim() });
    if (!detail) {
      return res.status(404).json({ success: false, message: "Course detail not found" });
    }

    res.status(200).json({ success: true, data: detail });
  } catch (error) {
    console.error("Get CourseDetail Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get all course details
exports.getAllCourseDetails = async (req, res) => {
  try {
    const details = await CourseDetail.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: details });
  } catch (error) {
    console.error("Get All CourseDetails Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// controllers/courseController.js

exports.getLiveBatches = async (req, res) => {
  try {
    const liveBatches = await CourseDetail.aggregate([
      {
        $match: {
          liveBatch: { $elemMatch: { live: true } }
        }
      },
      {
        $unwind: "$liveBatch"
      },
      // {
      //   $match: {
      //     "liveBatch.live": true
      //   }
      // },
      {
        $replaceRoot: { newRoot: "$liveBatch" }
      }
    ]);

    return res.status(200).json({ 
      success: true,
      liveBatches
    });
  } catch (error) {
    console.error("Get Live Batches Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch live batches"
    });
  }
};

// Delete a course detail
exports.deleteCourseDetail = async (req, res) => {
  try {
    const { courseId } = req.params;
    if (!courseId) {
      return res.status(400).json({ success: false, message: "courseId is required" });
    }

    const detail = await CourseDetail.findOneAndDelete({ courseId: courseId.trim() });
    if (!detail) {
      return res.status(404).json({ success: false, message: "Course detail not found" });
    }

    res.status(200).json({ success: true, message: "Course detail deleted successfully", data: detail });
  } catch (error) {
    console.error("Delete CourseDetail Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};