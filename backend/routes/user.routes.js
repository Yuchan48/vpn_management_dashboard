const express = require("express");
const router = express.Router();

const requireAdmin = require("../middleware/requireAdmin");

const userController = require("../controllers/user.controller");

/* Admin only routes */
// Create users
router.post("/user", requireAdmin, userController.createUser);

// Create admin users
router.post("/admin", requireAdmin, userController.createAdmin);

// Get all users
router.get("/", requireAdmin, userController.getAllUsers);

// Delete a user by ID
router.delete("/:id", requireAdmin, userController.deleteUser);

module.exports = router;
