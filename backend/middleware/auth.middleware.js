const jwt = require("jsonwebtoken");

// Middleware to authenticate JWT tokens in incoming requests
function authenticateToken(req, res, next) {
  const token = req.cookies.token; // Get token from cookies
  if (!token) {
    return res.status(401).json({ error: "Token missing" });
  }

  // Verify the token
  jwt.verify(
    token,
    process.env.JWT_SECRET,
    { issuer: "personal-vpn-backend" },
    (err, user) => {
      if (err) {
        console.log("JWT ERROR:", err.message);
        return res.status(401).json({ error: "Invalid token" });
      }

      // console.log("Decoded token: ", user); // debugging purpose

      // Attach user info to the request object for use in route handlers
      req.user = {
        id: user.sub,
        role: user.role,
      };

      // Proceed to the route handler
      next();
    },
  );
}

module.exports = authenticateToken;
