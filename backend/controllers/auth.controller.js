const { loginUser } = require("../services/auth.service");

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // login validation and token generation
    const { token } = await loginUser(username, password);

    return res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // HTTPS only in prod
        sameSite: "strict",
        maxAge: 1000 * 60 * 60, // 1 hour
      })
      .json({ message: "Login successful" });
  } catch (error) {
    console.error("Login error:", error);
    res
      .status(error.status || 500)
      .json({ error: error.error || "Internal server error" });
  }
};
