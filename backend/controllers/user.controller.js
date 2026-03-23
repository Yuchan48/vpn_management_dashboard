const userService = require("../services/user.service.js");
const {
  validateUsername,
  validatePassword,
} = require("../utils/inputValidators.js");

async function createUser(req, res, next) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    validateUsername(username);
    validatePassword(password);

    const user = await userService.createUser(username, password);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

async function createAdmin(req, res, next) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    validateUsername(username);
    validatePassword(password);

    const admin = await userService.createAdmin(username, password);
    res.status(201).json(admin);
  } catch (error) {
    next(error);
  }
}

async function getAllUsers(req, res, next) {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
}

async function deleteUser(req, res, next) {
  try {
    const targetUserId = Number(req.params.id);
    if (!Number.isInteger(targetUserId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    await userService.deleteUser(req.user, targetUserId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

// Change own password. User must provide current password for verification, and new password.
async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Both current password and new password are required" });
    }

    validatePassword(newPassword);

    await userService.changePassword(req.user, currentPassword, newPassword);
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
}

async function getCurrentUser(req, res, next) {
  try {
    const user = await userService.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createUser,
  createAdmin,
  getAllUsers,
  deleteUser,
  changePassword,
  getCurrentUser,
};
