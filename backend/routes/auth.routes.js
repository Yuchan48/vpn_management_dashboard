const express = require("express");
const router = express.Router();

const { login } = require("../controllers/auth.controller");
const { loginRateLimiter } = require("../middleware/rateLimit.middleware");
const authenticateToken = require("../middleware/auth.middleware");

// /auth
// login
router.post("/login", loginRateLimiter, login);

// logout
router.post("/logout", (req, res) => {
  res.clearCookie("token").json({ message: "Logout successful" });
});

module.exports = router;
