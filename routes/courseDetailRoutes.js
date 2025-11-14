const express = require("express");
const {
  createCourseDetail,
  updateCourseDetail,
  getAllCourseDetails,
  getCourseDetail,
  deleteCourseDetail,
  getLiveBatches
} = require("../controllers/courseDetailController");

const router = express.Router();

// Create: POST / → expects courseId in body
router.post("/", createCourseDetail);

// Update: PUT /:courseId → uses URL param
router.put("/:courseId", updateCourseDetail);

// Get courses by live
router.get("/live", getLiveBatches);

// Read
router.get("/", getAllCourseDetails);
router.get("/:courseId", getCourseDetail);

// Delete
router.delete("/:courseId", deleteCourseDetail);

module.exports = router;