const mongoose = require("mongoose");

const jobRequestSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    service: {
      type: String,
      enum: [
        "Electrical",
        "Plumbing",
        "AC Repair",
        "Cleaning",
        "Painting",
        "Carpentry",
        "Handyman",
        "Shifting"
      ],
      required: true
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },

    location: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },

    date: {
      type: String,
      default: null
    },

    urgency: {
      type: String,
      enum: ["Urgent", "Within a week", "Flexible"],
      default: "Flexible",
      required: true
    },

    budget: {
      type: Number,
      min: 0,
      default: null
    },

    phone: {
      type: String,
      required: true,
      match: /^\d{10}$/
    },

    photos: {
      type: [String],
      default: []
    },

    status: {
      type: String,
      enum: ["Available", "Accepted", "Completed"],
      default: "Available"
    },

    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Exact MongoDB collection name: jobs
const JobRequest = mongoose.model(
  "JobRequest",
  jobRequestSchema,
  "jobs"
);

module.exports = JobRequest;