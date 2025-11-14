// models/Workshop.js
const mongoose = require("mongoose");

const workshopSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    instructor: {
      type: String,
      required: [true, "Instructor is required"],
      trim: true,
    },
    duration: {
      type: String,
      required: [true, "Duration is required"],
      trim: true,
    },
    date: {
      type: String,
      required: [true, "Date is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    image: {
      type: String,
      required: [true, "Image is required"],
    },
    public_id: {
      type: String,
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    zoomLink: {
      type: String,
      required:true
    },
    category: {
      type: String,
      required: [true, "Category is required"],
    },
  },
  {
    timestamps: true,
  }
);

workshopSchema.index({ slug: 1 });
workshopSchema.index({ date: 1 });
workshopSchema.index({ category: 1 });

// Generate slug from title before saving (only if slug not provided or title changed)
workshopSchema.pre("save", function (next) {
  if (this.isModified("title") && !this.isModified("slug")) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/gi, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }
  next();
});

module.exports = mongoose.model("Workshop", workshopSchema);
