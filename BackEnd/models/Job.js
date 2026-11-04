
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
      required: true
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

module.exports = mongoose.model("Job", jobSchema);
