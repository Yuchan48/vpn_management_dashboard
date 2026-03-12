const express = require("express");
const router = express.Router();
const { login } = require("../controllers/auth.controller");
const { loginRateLimiter } = require("../middleware/rateLimit.middleware");

// POST /api/auth/login
router.post("/login", loginRateLimiter, login);

module.exports = router;
