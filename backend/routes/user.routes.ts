import express from "express";

import { requireAdmin } from "../middleware/requireAdmin";
import { requireRootAdmin } from "../middleware/requireRootAdmin";

import {
  createAdmin,
  createUser,
  getAllUsers,
  deleteUser,
  changePassword,
  getCurrentUser,
} from "../controllers/user.controller";

const router = express.Router();

/* Root admin only routes */
// Create admin users
router.post("/admin", requireRootAdmin, createAdmin);

/* Admin only routes */
// Create users
router.post("/user", requireAdmin, createUser);

// Get all users
router.get("/", requireAdmin, getAllUsers);

// Delete a user by ID
router.delete("/:id", requireAdmin, deleteUser);

/* User routes */
// Change own password
router.patch("/me/password", changePassword);

// Get current user info
router.get("/me", getCurrentUser);

export default router;
