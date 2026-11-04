
const express = require("express");
const mongoose = require("mongoose");

const JobRequest = require("../models/JobRequest");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const SERVICES = [
  "Electrical",
  "Plumbing",
  "AC Repair",
  "Cleaning",
  "Painting",
  "Carpentry",
  "Handyman",
  "Shifting"
];

const URGENCY_OPTIONS = ["Urgent", "Within a week", "Flexible"];

const isValidDate = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
};

const isValidPhotoUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
};

// CUSTOMER: Create a new job
router.post("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Only customers can post jobs"
      });
    }

    const {
      service,
      title,
      description,
      location,
      date = "",
      urgency = "Flexible",
      budget = "",
      phone,
      photos = []
    } = req.body || {};

    if (
      !SERVICES.includes(service) ||
      typeof title !== "string" ||
      !title.trim() ||
      title.trim().length > 120 ||
      typeof description !== "string" ||
      !description.trim() ||
      description.trim().length > 500 ||
      typeof location !== "string" ||
      !location.trim() ||
      location.trim().length > 120 ||
      typeof phone !== "string" ||
      !/^\d{10}$/.test(phone) ||
      !URGENCY_OPTIONS.includes(urgency)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid job details"
      });
    }

    if (date !== "" && date !== null && !isValidDate(date)) {
      return res.status(400).json({
        success: false,
        message: "Invalid preferred date"
      });
    }

    let normalizedBudget = null;

    if (budget !== "" && budget !== null && budget !== undefined) {
      if (
        (typeof budget !== "number" &&
          (typeof budget !== "string" || !budget.trim())) ||
        !Number.isFinite(Number(budget)) ||
        Number(budget) < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid budget"
        });
      }

      normalizedBudget = Number(budget);
    }

    if (
      !Array.isArray(photos) ||
      photos.length > 5 ||
      !photos.every(
        (photo) =>
          typeof photo === "string" && isValidPhotoUrl(photo)
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide up to 5 valid photo URLs"
      });
    }

    const job = await JobRequest.create({
      customer: req.user.userId,
      service,
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      date: date || null,
      urgency,
      budget: normalizedBudget,
      phone,
      photos,
      status: "Available",
      technician: null
    });

    const populatedJob = await JobRequest.findById(job._id)
      .populate("customer", "name email");

    return res.status(201).json({
      success: true,
      message: "Job posted successfully",
      job: populatedJob
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    console.error("Create job error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to create job"
    });
  }
});

// TECHNICIAN: Get available jobs matching skills
router.get("/available", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "technician") {
      return res.status(403).json({
        success: false,
        message: "Only technicians can view available jobs"
      });
    }

    const technician = await User.findById(req.user.userId);

    if (!technician || technician.role !== "technician") {
      return res.status(404).json({
        success: false,
        message: "Technician not found"
      });
    }

    if (!technician.serviceCategories || !technician.serviceCategories.length) {
      return res.json({
        success: true,
        count: 0,
        jobs: []
      });
    }

    const jobs = await JobRequest.find({
      status: "Available",
      technician: null,
      service: { $in: technician.serviceCategories }
    })
      .populate("customer", "name")
      .select("-location -phone")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: jobs.length,
      jobs
    });
  } catch (error) {
    console.error("Available jobs error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load available jobs"
    });
  }
});

// CUSTOMER: Get their posted jobs
router.get("/my", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Only customers can view their jobs"
      });
    }

    const jobs = await JobRequest.find({
      customer: req.user.userId
    })
      .populate("customer", "name email")
      .populate("technician", "name email")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: jobs.length,
      jobs
    });
  } catch (error) {
    console.error("My jobs error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch your jobs"
    });
  }
});

// TECHNICIAN: Get accepted and completed jobs
router.get("/my-jobs", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "technician") {
      return res.status(403).json({
        success: false,
        message: "Only technicians can view their jobs"
      });
    }

    const jobs = await JobRequest.find({
      technician: req.user.userId,
      status: { $in: ["Accepted", "Completed"] }
    })
      .populate("customer", "name email")
      .sort({ updatedAt: -1 });

    return res.json({
      success: true,
      count: jobs.length,
      jobs
    });
  } catch (error) {
    console.error("Technician jobs error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load your jobs"
    });
  }
});

// TECHNICIAN: Accept an available job
router.patch("/:id/accept", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "technician") {
      return res.status(403).json({
        success: false,
        message: "Only technicians can accept jobs"
      });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID"
      });
    }

    const technician = await User.findById(req.user.userId);

    if (!technician || technician.role !== "technician") {
      return res.status(404).json({
        success: false,
        message: "Technician not found"
      });
    }

    if (!technician.serviceCategories || !technician.serviceCategories.length) {
      return res.status(403).json({
        success: false,
        message: "Please select your service categories first"
      });
    }

    const job = await JobRequest.findOneAndUpdate(
      {
        _id: req.params.id,
        status: "Available",
        technician: null,
        service: { $in: technician.serviceCategories }
      },
      {
        $set: {
          status: "Accepted",
          technician: technician._id
        }
      },
      {
        returnDocument: "after",
        runValidators: true
      }
    ).populate("customer", "name email");

    if (!job) {
      return res.status(409).json({
        success: false,
        message: "Job is unavailable or does not match your skills"
      });
    }

    return res.json({
      success: true,
      message: "Job accepted successfully",
      job
    });
  } catch (error) {
    console.error("Accept job error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to accept job"
    });
  }
});

// TECHNICIAN: Mark an accepted job as completed
router.patch("/:id/complete", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "technician") {
      return res.status(403).json({
        success: false,
        message: "Only technicians can complete jobs"
      });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID"
      });
    }

    const job = await JobRequest.findOneAndUpdate(
      {
        _id: req.params.id,
        technician: req.user.userId,
        status: "Accepted"
      },
      {
        $set: {
          status: "Completed"
        }
      },
      {
        returnDocument: "after",
        runValidators: true
      }
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Accepted job not found or not assigned to you"
      });
    }

    return res.json({
      success: true,
      message: "Job completed successfully",
      job
    });
  } catch (error) {
    console.error("Complete job error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to complete job"
    });
  }
});

// TECHNICIAN: Get details of their assigned job
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "technician") {
      return res.status(403).json({
        success: false,
        message: "Only technicians can view job details"
      });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID"
      });
    }

    const job = await JobRequest.findOne({
      _id: req.params.id,
      technician: req.user.userId,
      status: { $in: ["Accepted", "Completed"] }
    }).populate("customer", "name email");

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found or not assigned to you"
      });
    }

    return res.json({
      success: true,
      job
    });
  } catch (error) {
    console.error("Job details error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load job details"
    });
  }
});

module.exports = router;
