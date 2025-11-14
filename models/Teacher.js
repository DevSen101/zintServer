// models/Teacher.js
const mongoose = require("mongoose");

const socialLinkSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^(https?:\/\/)/.test(v); // Basic URL validation
        },
        message: (props) => `${props.value} is not a valid URL!`,
      },
    },
  },
  { _id: false }
);

const teacherSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email"],
    },
    phoneNumber: {
      type: String,
      trim: true,
      match: [/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number"],
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
    },
    jobProfile: {
      type: String,
      required: [true, "Job profile is required"],
      trim: true,
    },
    coursesTaught: [
      {
        courseValue: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
          required: true,
        },
        courseLabel: {
          type: String,
          required: true, 
          trim: true,
        },
      },
    ],
    bio: {
      type: String,
      trim: true,
    },
    yearsOfExperience: {
      type: Number,
      required: [true, "Years of experience is required"],
      min: [0, "Experience cannot be negative"],
    },
    keyAchievements: [
      {
        type: String,
        trim: true,
        required: true,
      },
    ],
    photo: {
      type: String,
      trim: true,
    },
    socialLinks: [socialLinkSchema],
  },
  {
    timestamps: true,
  }
);

// Index for faster department or email queries
teacherSchema.index({ department: 1 });
teacherSchema.index({ email: 1 });

module.exports = mongoose.model("Teacher", teacherSchema);
