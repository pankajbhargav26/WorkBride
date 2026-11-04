
const express = require("express");
const mongoose = require("mongoose");

const Job = require("../models/Job");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// 1. CUSTOMER: POST A NEW JOB
// POST /api/jobs

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
      date,
      urgency,
      budget,
      phone,
      photos
    } = req.body;

    if (
      !service ||
      !title ||
      !description ||
      !location ||
      !date
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required job details"
      });
    }

    const jobDate = new Date(date);

    if (Number.isNaN(jobDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid job date"
      });
    }

    if (budget !== undefined && budget !== null) {
      if (
        typeof budget !== "number" ||
        !Number.isFinite(budget) ||
        budget < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Budget must be a valid non-negative number"
        });
      }
    }

    if (photos !== undefined) {
      if (
        !Array.isArray(photos) ||
        !photos.every(photo => typeof photo === "string")
      ) {
        return res.status(400).json({
          success: false,
          message: "Photos must be an array of image URLs"
        });
      }
    }

    const customer = await User.findById(req.user.userId);

    if (!customer || customer.role !== "customer") {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }

    const job = await Job.create({
      customer: customer._id,
      service,
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      date: jobDate,
      urgency: urgency || "Flexible",
      budget: budget ?? null,
      phone: phone || "",
      photos: photos || [],
      status: "Available",
      technician: null
    });

    return res.status(201).json({
      success: true,
      message: "Job posted successfully",
      job
    });

  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    console.error("Post job error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to post job"
    });
  }
});


// 2. TECHNICIAN: GET AVAILABLE JOBS
// GET /api/jobs/available

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

    if (!technician.serviceCategories ||
        technician.serviceCategories.length === 0) {
      return res.json({
        success: true,
        count: 0,
        jobs: []
      });
    }

    const jobs = await Job.find({
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


// 3. TECHNICIAN: GET ACCEPTED AND COMPLETED JOBS
// GET /api/jobs/my-jobs

router.get("/my-jobs", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "technician") {
      return res.status(403).json({
        success: false,
        message: "Only technicians can view their jobs"
      });
    }

    const jobs = await Job.find({
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
    console.error("My jobs error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load your jobs"
    });
  }
});


// 4. TECHNICIAN: ACCEPT A JOB
// PATCH /api/jobs/:id/accept

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

    if (!technician.serviceCategories ||
        technician.serviceCategories.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Please select your service categories first"
      });
    }

    // Only matching technicians can accept this job.
    // Atomic update prevents two technicians accepting the same job.
    const job = await Job.findOneAndUpdate(
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
        new: true,
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


// 5. TECHNICIAN: COMPLETE A JOB
// PATCH /api/jobs/:id/complete

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

    const job = await Job.findOneAndUpdate(
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
        new: true,
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


// 6. TECHNICIAN: GET SINGLE JOB DETAILS
// GET /api/jobs/:id

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

    const job = await Job.findOne({
      _id: req.params.id,
      technician: req.user.userId,
      status: { $in: ["Accepted", "Completed"] }
    })
      .populate("customer", "name email");

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
