
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true,
      select: false
    },

    role: {
      type: String,
      enum: ["customer", "technician", "admin"],
      default: "customer"
    },

    serviceCategories: {
      type: [String],
      enum: [
        "Electrical",
        "Plumbing",
        "AC Repair",
        "Cleaning",
        "Painting",
        "Carpentry",
        "Handyman"
      ],
      default: []
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);
