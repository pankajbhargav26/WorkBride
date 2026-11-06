const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
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
      trim: true
    },

    description: {
      type: String,
      required: true,
      trim: true
    },

    location: {
      type: String,
      required: true,
      trim: true
    },

    date: {
      type: Date,
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
      trim: true
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
        "Completed",
        "Repair Not Proceeded",
        "Inspection Only" // legacy value, kept so old jobs still load
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
      trim: true,
      default: ""
    },

    visitedAt: {
      type: Date,
      default: null
    },

    // Inspection / visiting fee. Separate from the repair estimate.
    visitingCharge: {
      type: Number,
      default: null,
      min: 0
    },

    estimatedCharges: {
      type: Number,
      default: null,
      min: 0
    },

    estimateNotes: {
      type: String,
      trim: true,
      default: ""
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

    completionType: {
      type: String,
      enum: ["Work Completed", "Customer Did Not Proceed", "Only Inspection"],
      default: null
    },

    completionPhoto: {
      type: String,
      default: null
    },

    inspectionDescription: {
      type: String,
      trim: true,
      default: ""
    },

    completedAt: {
      type: Date,
      default: null
    },

    inspectionAt: {
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
      trim: true,
      default: ""
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

module.exports = mongoose.model("Job", jobSchema);