const mongoose = require("mongoose");

const serviceCategories = [
  "Electrical",
  "Plumbing",
  "AC Repair",
  "Cleaning",
  "Painting",
  "Carpentry",
  "Handyman"
];

const jobSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    serviceCategory: {
      type: String,
      enum: serviceCategories,
      required: true
    },
    problemDescription: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    preferredDate: {
      type: Date,
      required: true
    },
    preferredTime: {
      type: String,
      required: true,
      trim: true
    },
    charges: {
      type: Number,
      default: 200
    },
    technicianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    status: {
      type: String,
      default: "Pending"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Job", jobSchema);
