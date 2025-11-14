const express = require("express");
const multer = require("multer");
const fs = require("fs");
const cloudinary = require("../config/cloudinary");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Upload endpoint
router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "No file uploaded" 
      });
    }

    const { mimetype, path, originalname } = req.file;

    let resource_type = "auto";
    let folder = "uploads";

    if (mimetype === "application/pdf") {
      resource_type = "raw";
      folder = "course_pdfs";
    } else if (mimetype.startsWith("image/")) {
      resource_type = "image";
      folder = "course_images";
    } else {
      fs.unlinkSync(path);
      return res.status(400).json({ 
        success: false, 
        message: "Unsupported file type. Only images and PDFs are allowed." 
      });
    }

    const result = await cloudinary.uploader.upload(path, {
      folder,
      resource_type,
      use_filename: true,
      unique_filename: true, // Changed to true to avoid conflicts
      public_id: `${Date.now()}_${originalname.split(".")[0]}`,
      type: "upload",
      access_mode: "public",
      format: mimetype === "application/pdf" ? "pdf" : undefined,
    });

    // Clean up local file
    fs.unlinkSync(path);

    res.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      resource_type: result.resource_type,
      original_filename: result.original_filename,
      format: result.format,
    });
  } catch (err) {
    console.error("Upload error:", err);
    
    // Clean up local file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      success: false, 
      message: "Upload failed",
      error: err.message 
    });
  }
});

// Delete endpoint
router.delete("/", async (req, res) => {
  try {
    const { public_id, resource_type } = req.body;

    if (!public_id) {
      return res.status(400).json({ 
        success: false, 
        message: "public_id is required" 
      });
    }

    // Determine resource type if not provided
    const type = resource_type || "image";

    const result = await cloudinary.uploader.destroy(public_id, {
      resource_type: type,
      invalidate: true, // Invalidate CDN cache
    });

    if (result.result === "ok" || result.result === "not found") {
      res.json({
        success: true,
        message: result.result === "ok" 
          ? "File deleted successfully" 
          : "File not found (may have been deleted already)",
        result: result.result,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Failed to delete file",
        result: result.result,
      });
    }
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Delete failed",
      error: err.message 
    });
  }
});

// Helper function to extract public_id from Cloudinary URL
router.post("/delete-by-url", async (req, res) => {
  try {
    const { url } = req.body;
    console.log("url",url)

    if (!url) {
      return res.status(400).json({ 
        success: false, 
        message: "URL is required" 
      });
    }

    // Extract public_id from URL
    // Example URL: https://res.cloudinary.com/demo/image/upload/v1234567890/course_images/sample.jpg
    const urlParts = url.split("/");
    const uploadIndex = urlParts.indexOf("upload");
    
    if (uploadIndex === -1) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid Cloudinary URL" 
      });
    }

    // Get everything after "upload/v{version}/"
    const publicIdWithFolder = urlParts.slice(uploadIndex + 2).join("/");
    const public_id = publicIdWithFolder.split(".")[0]; // Remove extension

    // Determine resource type from URL
    let resource_type = "image";
    if (url.includes("/raw/")) resource_type = "raw";
    else if (url.includes("/video/")) resource_type = "video";

    const result = await cloudinary.uploader.destroy(public_id, {
      resource_type,
      invalidate: true,
    });

    if (result.result === "ok" || result.result === "not found") {
      res.json({
        success: true,
        message: result.result === "ok" 
          ? "File deleted successfully" 
          : "File not found (may have been deleted already)",
        result: result.result,
        public_id,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Failed to delete file",
        result: result.result,
      });
    }
  } catch (err) {
    console.error("Delete by URL error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Delete failed",
      error: err.message 
    });
  }
});

module.exports = router;