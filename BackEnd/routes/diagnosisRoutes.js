const express = require("express");
const { getDiagnosisReply } = require("../services/diagnosisEngine");

const router = express.Router();
const MAX_MESSAGES = 10;
const MAX_MESSAGE_LENGTH = 500;

router.post("/", (req, res) => {
  const { messages } = req.body || {};

  if (
    !Array.isArray(messages) ||
    messages.length === 0 ||
    messages.length > MAX_MESSAGES ||
    messages[messages.length - 1]?.role !== "user" ||
    !messages.every(
      (message) =>
        message &&
        ["user", "assistant"].includes(message.role) &&
        typeof message.content === "string" &&
        message.content.trim().length > 0 &&
        message.content.length <= MAX_MESSAGE_LENGTH
    )
  ) {
    return res.status(400).json({
      success: false,
      message: `Provide 1-${MAX_MESSAGES} conversation messages, ending with a user message of at most ${MAX_MESSAGE_LENGTH} characters`
    });
  }

  const result = getDiagnosisReply(messages);

  return res.json({
    success: true,
    ...result
  });
});

module.exports = router;
