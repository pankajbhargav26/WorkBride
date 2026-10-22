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
    title: {
      type: String,
      trim: true,
      maxlength: 120
    },
    problemDescription: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
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
    urgency: {
      type: String,
      enum: ["Urgent", "Within a week", "Flexible"],
      default: "Flexible"
    },
    budget: {
      type: Number,
      min: 0
    },
    customerName: {
      type: String,
      trim: true,
      maxlength: 120
    },
    phone: {
      type: String,
      trim: true,
      match: /^\d{10}$/
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
