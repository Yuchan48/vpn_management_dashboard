function validateUsername(username) {
  if (typeof username !== "string") {
    throw new Error("Username must be a string");
  }

  username = username.trim();
  if (username.length < 3) {
    throw new Error("Username must be at least 3 characters");
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    throw new Error(
      "Username can only contain letters, numbers, underscores, and hyphens",
    );
  }
}

function validatePassword(password) {
  if (typeof password !== "string") {
    throw new Error("Password must be a string");
  }
  password = password.trim();
  // password must be minimum of 8 characters long.
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }
}

module.exports = {
  validateUsername,
  validatePassword,
};
