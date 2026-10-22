const express = require("express");
const mongoose = require("mongoose");
const Job = require("../models/Job");
const authenticateCustomer = require("../middleware/authMiddleware");
const authenticateAdmin = require("../middleware/adminMiddleware");

const router = express.Router();
const serviceCategories = Job.schema.path("serviceCategory").enumValues;

router.get("/admin/all", authenticateAdmin, async (req, res) => {
  const parsedPage = Number.parseInt(req.query.page, 10);
  const parsedLimit = Number.parseInt(req.query.limit, 10);
  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const limit = Number.isInteger(parsedLimit) && parsedLimit > 0
    ? Math.min(parsedLimit, 100)
    : 20;

  try {
    const [jobs, total] = await Promise.all([
      Job.find({})
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Job.countDocuments({})
    ]);

    return res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      jobs
    });
  } catch (error) {
    console.error("Fetching all jobs for admin failed:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch jobs"
    });
  }
});

router.post("/", authenticateCustomer, async (req, res) => {
  const {
    serviceCategory,
    title,
    problemDescription,
    address,
    preferredDate,
    preferredTime,
    urgency,
    budget,
    customerName,
    phone
  } = req.body || {};

  const requiredFields = {
    serviceCategory,
    problemDescription,
    address,
    preferredDate,
    preferredTime
  };

  const missingFields = Object.entries(requiredFields)
    .filter(([, value]) => typeof value !== "string" || !value.trim())
    .map(([field]) => field);

  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Required fields are missing or invalid",
      fields: missingFields
    });
  }

  if (!serviceCategories.includes(serviceCategory.trim())) {
    return res.status(400).json({
      success: false,
      message: "Invalid service category",
      allowedCategories: serviceCategories
    });
  }

  const parsedPreferredDate = new Date(preferredDate);
  if (Number.isNaN(parsedPreferredDate.getTime())) {
    return res.status(400).json({
      success: false,
      message: "preferredDate must be a valid date"
    });
  }

  if (urgency !== undefined && !["Urgent", "Within a week", "Flexible"].includes(urgency)) {
    return res.status(400).json({
      success: false,
      message: "Invalid urgency"
    });
  }

  if (budget !== undefined && (!Number.isFinite(budget) || budget < 0)) {
    return res.status(400).json({
      success: false,
      message: "budget must be a non-negative number"
    });
  }

  if (phone !== undefined && !/^\d{10}$/.test(phone)) {
    return res.status(400).json({
      success: false,
      message: "phone must contain exactly 10 digits"
    });
  }

  try {
    const job = await Job.create({
      customerId: req.user.id,
      serviceCategory: serviceCategory.trim(),
      title: title && title.trim(),
      problemDescription: problemDescription.trim(),
      address: address.trim(),
      preferredDate: parsedPreferredDate,
      preferredTime: preferredTime.trim(),
      urgency,
      budget,
      customerName: customerName && customerName.trim(),
      phone: phone && phone.trim()
    });

    return res.status(201).json({
      success: true,
      job
    });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError) {
      return res.status(400).json({
        success: false,
        message: "Job data is invalid",
        error: error.message
      });
    }

    console.error("Job creation failed:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to create job"
    });
  }
});

router.get("/my-jobs", authenticateCustomer, async (req, res) => {
  try {
    const jobs = await Job.find({ customerId: req.user.id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: jobs.length,
      jobs
    });
  } catch (error) {
    console.error("Fetching customer jobs failed:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch jobs"
    });
  }
});

router.get("/:id", authenticateCustomer, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid job ID"
    });
  }

  try {
    const job = await Job.findOne({
      _id: req.params.id,
      customerId: req.user.id
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }

    return res.status(200).json({
      success: true,
      job
    });
  } catch (error) {
    console.error("Fetching job details failed:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch job"
    });
  }
});

module.exports = router;
