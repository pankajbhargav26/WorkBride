const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { randomUUID } = require("crypto");

const JobRequest = require("../models/Job");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// -------------------- FILE UPLOAD SETUP --------------------

const uploadFolder = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomUUID()}${extension}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only JPG, PNG and WEBP images are allowed"));
    }

    cb(null, true);
  }
});

// Handle upload errors
const uploadCompletionPhoto = (req, res, next) => {
  upload.single("completionPhoto")(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        success: false,
        message:
          error.code === "LIMIT_FILE_SIZE"
            ? "Image size must be less than 5 MB"
            : error.message
      });
    }

    next();
  });
};

// -------------------- CONSTANTS --------------------

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

// "Inspection Only" is the old name of "Repair Not Proceeded"
const NOT_PROCEEDED_STATUSES = ["Repair Not Proceeded", "Inspection Only"];

const ASSIGNED_STATUSES = [
  "Accepted",
  "Visited",
  "Estimate Given",
  "In Progress",
  "Completed",
  ...NOT_PROCEEDED_STATUSES
];

// -------------------- HELPER FUNCTIONS --------------------

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

// -------------------- CUSTOMER: CREATE JOB --------------------

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
        (photo) => typeof photo === "string" && isValidPhotoUrl(photo)
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

// -------------------- TECHNICIAN: AVAILABLE JOBS --------------------

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

// -------------------- CUSTOMER: MY JOBS --------------------

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

// -------------------- TECHNICIAN: MY ASSIGNED JOBS --------------------

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
      status: { $in: ASSIGNED_STATUSES }
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

// -------------------- TECHNICIAN: ACCEPT JOB --------------------

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

// -------------------- TECHNICIAN: ADD VISIT DETAILS --------------------

router.patch("/:id/visit", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "technician") {
      return res.status(403).json({
        success: false,
        message: "Only technicians can add visit details"
      });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID"
      });
    }

    const { visitDetails, visitingCharge } = req.body || {};

    if (
      typeof visitDetails !== "string" ||
      !visitDetails.trim() ||
      visitDetails.trim().length > 1000
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid visit details are required"
      });
    }

    if (
      typeof visitingCharge !== "number" ||
      !Number.isFinite(visitingCharge) ||
      visitingCharge < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid visiting charge"
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
          visitDetails: visitDetails.trim(),
          visitingCharge,
          visitedAt: new Date(),
          status: "Visited"
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
      message: "Visit details saved successfully",
      job
    });
  } catch (error) {
    console.error("Visit details error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to save visit details"
    });
  }
});

// -------------------- TECHNICIAN: SUBMIT ESTIMATE --------------------

router.patch("/:id/estimate", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "technician") {
      return res.status(403).json({
        success: false,
        message: "Only technicians can submit estimates"
      });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID"
      });
    }

    const { estimatedCharges, estimateNotes = "" } = req.body;

    if (
      typeof estimatedCharges !== "number" ||
      !Number.isFinite(estimatedCharges) ||
      estimatedCharges < 0 ||
      typeof estimateNotes !== "string" ||
      estimateNotes.length > 500
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid estimate details"
      });
    }

    const job = await JobRequest.findOneAndUpdate(
      {
        _id: req.params.id,
        technician: req.user.userId,
        status: "Visited",
        $or: [
          { estimateStatus: { $in: ["Not Sent", "Rejected"] } },
          { estimateStatus: { $exists: false } }
        ]
      },
      {
        $set: {
          estimatedCharges,
          estimateNotes: estimateNotes.trim(),
          estimateStatus: "Pending",
          estimateUpdatedAt: new Date(),
          status: "Estimate Given"
        }
      },
      {
        returnDocument: "after",
        runValidators: true
      }
    );

    if (!job) {
      return res.status(409).json({
        success: false,
        message: "Job is not ready for a new estimate"
      });
    }

    return res.json({
      success: true,
      message: "Estimate submitted successfully",
      job
    });
  } catch (error) {
    console.error("Estimate error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to submit estimate"
    });
  }
});

// -------------------- CUSTOMER: APPROVE ESTIMATE --------------------

router.patch("/:id/approve-estimate", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Only customers can approve estimates"
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
        customer: req.user.userId,
        status: "Estimate Given",
        estimateStatus: "Pending"
      },
      {
        $set: {
          status: "In Progress",
          estimateStatus: "Approved"
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
        message: "Pending estimate not found"
      });
    }

    return res.json({
      success: true,
      message: "Estimate approved successfully",
      job
    });
  } catch (error) {
    console.error("Approve estimate error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to approve estimate"
    });
  }
});

// -------------------- CUSTOMER: REJECT ESTIMATE --------------------

router.patch("/:id/reject-estimate", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Only customers can reject estimates"
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
        customer: req.user.userId,
        status: "Estimate Given",
        estimateStatus: "Pending"
      },
      {
        $set: {
          status: "Repair Not Proceeded",
          estimateStatus: "Rejected",
          estimateUpdatedAt: new Date(),
          completionType: "Customer Did Not Proceed",
          inspectionDescription: "Customer did not approve the repair estimate.",
          inspectionAt: new Date(),
          completionPhoto: null,
          completedAt: null
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
        message: "Pending estimate not found"
      });
    }

    return res.json({
      success: true,
      message: "Repair not proceeded. Only the visiting charge applies.",
      job
    });
  } catch (error) {
    console.error("Reject estimate error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to reject estimate"
    });
  }
});

// -------------------- TECHNICIAN: WORK COMPLETED WITH PHOTO --------------------

router.patch(
  "/:id/complete",
  authMiddleware,
  uploadCompletionPhoto,
  async (req, res) => {
    let uploadedFilePath = req.file?.path;

    try {
      if (req.user.role !== "technician") {
        if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
          fs.unlinkSync(uploadedFilePath);
        }

        return res.status(403).json({
          success: false,
          message: "Only technicians can complete jobs"
        });
      }

      if (!mongoose.isValidObjectId(req.params.id)) {
        if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
          fs.unlinkSync(uploadedFilePath);
        }

        return res.status(400).json({
          success: false,
          message: "Invalid job ID"
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Completion photo is required"
        });
      }

      const photoUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

      const job = await JobRequest.findOneAndUpdate(
        {
          _id: req.params.id,
          technician: req.user.userId,
          status: "In Progress"
        },
        {
          $set: {
            status: "Completed",
            completionType: "Work Completed",
            completionPhoto: photoUrl,
            inspectionDescription: "",
            completedAt: new Date(),
            inspectionAt: null
          }
        },
        {
          returnDocument: "after",
          runValidators: true
        }
      );

      if (!job) {
        if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
          fs.unlinkSync(uploadedFilePath);
        }

        return res.status(404).json({
          success: false,
          message: "In-progress job not found or not assigned to you"
        });
      }

      return res.json({
        success: true,
        message: "Work completed and photo uploaded successfully",
        job
      });
    } catch (error) {
      if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
        fs.unlinkSync(uploadedFilePath);
      }

      console.error("Complete job error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Unable to complete job"
      });
    }
  }
);

// -------------------- TECHNICIAN: CUSTOMER DID NOT PROCEED --------------------
// Repair is not done, but the visiting charge still applies.
// "/inspection-only" is kept as an alias for the old frontend.

router.patch(
  ["/:id/did-not-proceed", "/:id/inspection-only"],
  authMiddleware,
  async (req, res) => {
    try {
      if (req.user.role !== "technician") {
        return res.status(403).json({
          success: false,
          message: "Only technicians can mark a job as repair not proceeded"
        });
      }

      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid job ID"
        });
      }

      const { inspectionDescription } = req.body || {};

      if (
        typeof inspectionDescription !== "string" ||
        !inspectionDescription.trim() ||
        inspectionDescription.trim().length > 1000
      ) {
        return res.status(400).json({
          success: false,
          message: "Please enter the reason / inspection details"
        });
      }

      // Only before the customer approves the repair
      const job = await JobRequest.findOneAndUpdate(
        {
          _id: req.params.id,
          technician: req.user.userId,
          status: { $in: ["Visited", "Estimate Given"] }
        },
        {
          $set: {
            status: "Repair Not Proceeded",
            completionType: "Customer Did Not Proceed",
            inspectionDescription: inspectionDescription.trim(),
            inspectionAt: new Date(),
            estimateStatus: "Rejected",
            estimateUpdatedAt: new Date(),
            completionPhoto: null,
            completedAt: null
          }
        },
        {
          returnDocument: "after",
          runValidators: true
        }
      );

      if (!job) {
        return res.status(409).json({
          success: false,
          message: "Job is not available for this action"
        });
      }

      return res.json({
        success: true,
        message: "Marked as Repair Not Proceeded. Visiting charge applies.",
        job
      });
    } catch (error) {
      console.error("Did-not-proceed error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Unable to update job"
      });
    }
  }
);

// -------------------- CUSTOMER: RATING AND FEEDBACK --------------------

router.patch("/:id/feedback", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Only customers can submit feedback"
      });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID"
      });
    }

    const { rating, feedback = "" } = req.body || {};

    if (
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5 ||
      typeof feedback !== "string" ||
      feedback.length > 500
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be 1-5 and feedback up to 500 characters"
      });
    }

    const job = await JobRequest.findOneAndUpdate(
      {
        _id: req.params.id,
        customer: req.user.userId,
        status: { $in: ["Completed", ...NOT_PROCEEDED_STATUSES] },
        rating: null
      },
      {
        $set: {
          rating,
          feedback: feedback.trim(),
          reviewedAt: new Date()
        }
      },
      {
        returnDocument: "after",
        runValidators: true
      }
    );

    if (!job) {
      return res.status(409).json({
        success: false,
        message: "Job not found or feedback already submitted"
      });
    }

    return res.json({
      success: true,
      message: "Feedback submitted successfully",
      job
    });
  } catch (error) {
    console.error("Feedback error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to submit feedback"
    });
  }
});

// -------------------- TECHNICIAN: JOB DETAILS --------------------

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

    const technician = await User.findById(req.user.userId);

    if (!technician || technician.role !== "technician") {
      return res.status(404).json({
        success: false,
        message: "Technician not found"
      });
    }

    const job = await JobRequest.findOne({
      _id: req.params.id,
      $or: [
        {
          status: "Available",
          technician: null,
          service: { $in: technician.serviceCategories || [] }
        },
        {
          technician: technician._id,
          status: { $in: ASSIGNED_STATUSES }
        }
      ]
    }).populate("customer", "name email");

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found or not available to you"
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