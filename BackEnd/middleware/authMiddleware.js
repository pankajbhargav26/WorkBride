const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");

const authenticateCustomer = async (req, res, next) => {
  const authorization = req.get("Authorization");
  const tokenMatch = authorization && authorization.match(/^Bearer\s+(.+)$/i);

  if (!tokenMatch) {
    return res.status(401).json({
      success: false,
      message: "A valid Bearer token is required"
    });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("JWT_SECRET is not configured");
    return res.status(500).json({
      success: false,
      message: "Authentication is not configured"
    });
  }

  let payload;
  try {
    payload = jwt.verify(tokenMatch[1], secret);
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token"
      });
    }

    console.error("Token verification failed:", error);
    return res.status(500).json({
      success: false,
      message: "Authentication failed"
    });
  }

  const customerId = payload && typeof payload === "object"
    ? payload.id || payload.sub
    : null;

  if (typeof customerId !== "string" || !mongoose.isValidObjectId(customerId)) {
    return res.status(401).json({
      success: false,
      message: "Token does not identify a valid user"
    });
  }

  try {
    const customer = await User.findById(customerId).select("_id role");

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "User for this token no longer exists"
      });
    }

    if (customer.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Only customers can access job APIs"
      });
    }

    req.user = { id: customer._id.toString() };
    return next();
  } catch (error) {
    console.error("Customer authentication failed:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to authenticate customer"
    });
  }
};

module.exports = authenticateCustomer;
