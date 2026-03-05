const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Basic validation
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    // Check if username matches the one stored in environment variable.
    const validUsername = username === process.env.ADMIN_USERNAME;

    // Compare password with the hashed password stored in environment variable
    const passwordMatch = await bcrypt.compare(
      password,
      process.env.ADMIN_PASSWORD_HASH,
    );

    if (!validUsername || !passwordMatch) {
      return res.status(401).json({ error: "Invalid login information" });
    }

    // Generate JWT token
    const token = jwt.sign({ sub: username }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    });
    return res.json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
