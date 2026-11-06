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
      trim: true
    },

    date: {
      type: String,
      default: null
    },

    urgency: {
      type: String,
      enum: ["Urgent", "Within a week", "Flexible"],
      default: "Flexible"
    },

    budget: {
      type: Number,
      default: null,
      min: 0
    },

    phone: {
      type: String,
      required: true
    },

    photos: {
      type: [String],
      default: []
    },

    status: {
      type: String,
      enum: [
        "Available",
        "Accepted",
        "Visited",
        "Estimate Given",
        "In Progress",
        "Completed"
      ],
      default: "Available"
    },

    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    visitDetails: {
      type: String,
      default: "",
      maxlength: 1000
    },

    visitedAt: {
      type: Date,
      default: null
    },

    estimatedCharges: {
      type: Number,
      min: 0,
      default: null
    },

    estimateNotes: {
      type: String,
      default: "",
      maxlength: 500
    },

    estimateStatus: {
      type: String,
      enum: ["Not Sent", "Pending", "Approved", "Rejected"],
      default: "Not Sent"
    },

    estimateUpdatedAt: {
      type: Date,
      default: null
    },

    completionPhoto: {
      type: String,
      default: null
    },

    completedAt: {
      type: Date,
      default: null
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },

    feedback: {
      type: String,
      default: "",
      maxlength: 500
    },

    reviewedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "JobRequest",
  jobRequestSchema,
  "jobs"
);