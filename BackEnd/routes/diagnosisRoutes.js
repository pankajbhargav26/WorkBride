const express = require("express");
const { getDiagnosis } = require("../services/diagnosisService");

const router = express.Router();

const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 1500;
const MAX_TOTAL_MESSAGE_LENGTH = 10000;
const MAX_CATEGORIES = 20;
const SUPPORTED_CATEGORY_KEYS = new Set([
  "plumbing",
  "electrical",
  "cleaning",
  "painting",
  "ac-repair",
  "carpentry",
  "handyman",
  "moving",
]);

function validateRequest(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return "A JSON request body is required";
  }

  if (!["en", "hi"].includes(body.language)) {
    return "language must be 'en' or 'hi'";
  }

  if (
    !Array.isArray(body.messages) ||
    body.messages.length === 0 ||
    body.messages.length > MAX_MESSAGES
  ) {
    return `messages must contain between 1 and ${MAX_MESSAGES} entries`;
  }

  let totalMessageLength = 0;
  for (const message of body.messages) {
    if (
      !message ||
      typeof message !== "object" ||
      !["user", "assistant"].includes(message.role) ||
      typeof message.content !== "string" ||
      !message.content.trim() ||
      message.content.length > MAX_MESSAGE_LENGTH
    ) {
      return `each message must have a valid role and non-empty content of at most ${MAX_MESSAGE_LENGTH} characters`;
    }

    totalMessageLength += message.content.length;
  }

  if (totalMessageLength > MAX_TOTAL_MESSAGE_LENGTH) {
    return "conversation is too long";
  }

  if (body.messages[body.messages.length - 1].role !== "user") {
    return "the last conversation message must be from the user";
  }

  if (
    !Array.isArray(body.categories) ||
    body.categories.length === 0 ||
    body.categories.length > MAX_CATEGORIES
  ) {
    return `categories must contain between 1 and ${MAX_CATEGORIES} entries`;
  }

  const categoryKeys = new Set();
  for (const category of body.categories) {
    if (
      !category ||
      typeof category !== "object" ||
      typeof category.key !== "string" ||
      !/^[a-z0-9-]+$/.test(category.key) ||
      !SUPPORTED_CATEGORY_KEYS.has(category.key) ||
      categoryKeys.has(category.key) ||
      typeof category.name !== "string" ||
      !category.name.trim() ||
      category.name.length > 100 ||
      typeof category.description !== "string" ||
      category.description.length > 500 ||
      !Array.isArray(category.subServices) ||
      category.subServices.length > 30 ||
      category.subServices.some((item) => typeof item !== "string" || item.length > 100)
    ) {
      return "categories must contain unique keys and valid service details";
    }

    categoryKeys.add(category.key);
  }

  return null;
}

router.post("/chat", async (req, res) => {
  const validationError = validateRequest(req.body);
  if (validationError) {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_REQUEST",
        message: validationError,
      },
    });
  }

  try {
    const result = await getDiagnosis({
      language: req.body.language,
      messages: req.body.messages,
      categories: req.body.categories,
    });

    return res.status(200).json({
      success: true,
      data: {
        language: req.body.language,
        ...result,
      },
    });
  } catch (error) {
    if (error.status && error.code) {
      return res.status(error.status).json({
        success: false,
        error: {
          code: error.code,
          message: error.publicMessage,
        },
      });
    }

    console.error("Diagnosis request failed:", error.message);
    return res.status(500).json({
      success: false,
      error: {
        code: "DIAGNOSIS_FAILED",
        message: "The diagnosis could not be completed. Please try again.",
      },
    });
  }
});

module.exports = router;
