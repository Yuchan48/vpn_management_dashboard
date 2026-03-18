const express = require("express");
const router = express.Router();

const requireAdmin = require("../middleware/requireAdmin");
const requireRootAdmin = require("../middleware/requireRootAdmin");

const userController = require("../controllers/user.controller");

/* Root admin only routes */
// Create admin users
router.post("/admin", requireRootAdmin, userController.createAdmin);

/* Admin only routes */
// Create users
router.post("/user", requireAdmin, userController.createUser);

// Get all users
router.get("/", requireAdmin, userController.getAllUsers);

// Delete a user by ID
router.delete("/:id", requireAdmin, userController.deleteUser);

/* User routes */
// Change own password
router.patch("/me/password", userController.changePassword);

// Get current user info
router.get("/me", userController.getCurrentUser);

module.exports = router;
