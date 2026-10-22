const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");

function authorizeRole(requiredRole) {
  return async (req, res, next) => {
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

    const userId = payload && typeof payload === "object"
      ? payload.id || payload.sub
      : null;

    if (typeof userId !== "string" || !mongoose.isValidObjectId(userId)) {
      return res.status(401).json({
        success: false,
        message: "Token does not identify a valid user"
      });
    }

    try {
      const user = await User.findById(userId).select("_id role");

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User for this token no longer exists"
        });
      }

      if (user.role !== requiredRole) {
        return res.status(403).json({
          success: false,
          message: `Only ${requiredRole}s can access this resource`
        });
      }

      req.user = { id: user._id.toString(), role: user.role };
      return next();
    } catch (error) {
      console.error("User authentication failed:", error);
      return res.status(500).json({
        success: false,
        message: "Unable to authenticate user"
      });
    }
  };
}

module.exports = authorizeRole;
