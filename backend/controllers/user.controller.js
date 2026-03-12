const userService = require("../services/user.service.js");

async function createUser(req, res, next) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    const user = await userService.createUser(username, password);
    res.status(201).json(user);
  } catch (error) {
    next(error);
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

module.exports = {
  createUser,
  createAdmin,
  getAllUsers,
  deleteUser,
};
