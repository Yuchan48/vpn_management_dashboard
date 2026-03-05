const DUMMY_PASSWORD_HASH =
  "$2b$10$NRAJfG4vQVirNN1TjeZUyuWFXccY8zk12pF7t9djrPJH691uyYouq"; // bcrypt hash for "dummy_password"

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { findUserByUsername } = require("../repositories/user.repository");

async function loginUser(username, password) {
  if (!username || !password) {
    throw { error: "Username and password are required", status: 400 };
  }

  // Fetch user from the database
  const user = await findUserByUsername(username);

  // If user not found, use a dummy hash to prevent timing attacks
  const passwordHash = user ? user.password_hash : DUMMY_PASSWORD_HASH;

  // Compare the provided password with the stored hash
  const isMatch = await bcrypt.compare(password, passwordHash);

  if (!user || !isMatch) {
    throw { error: "Invalid login information", status: 401 };
  }

  // Generate JWT token
  const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    issuer: "personal-vpn-backend",
  });

  return { token, user };
}

module.exports = {
  loginUser,
};
