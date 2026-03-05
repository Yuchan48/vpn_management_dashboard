const { loginUser } = require("../services/auth.service");

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // login validation and token generation
    const { token } = await loginUser(username, password);

    return res.json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res
      .status(error.status || 500)
      .json({ error: error.error || "Internal server error" });
  }
};
