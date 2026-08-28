import express from "express";

import { login } from "../controllers/auth.controller";
import { loginRateLimiter } from "../middleware/rateLimit.middleware";

const router = express.Router();

/* Authentication routes /auth */
// login
router.post("/login", loginRateLimiter, login);

// logout
router.post("/logout", (_req, res) => {
  res.clearCookie("token").json({ message: "Logout successful" });
});

export default router;
