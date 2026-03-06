const jwt = require("jsonwebtoken");

// Middleware to authenticate JWT tokens in incoming requests
function authenticateToken(req, res, next) {
  // Get the Bearer token ("Bearer <token>") from the Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header missing" });
  }

  const parts = authHeader.split(" "); // ["Bearer", "<token>"]
  // verify the Bearer token format
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res
      .status(401)
      .json({ error: "Invalid Authorization header format" });
  }

  // Extract the token part
  const token = parts[1];
  if (!token) {
    return res.status(401).json({ error: "Token missing" });
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log("JWT ERROR:", err.message);
      return res.status(401).json({ error: "Invalid token" });
    }

    // console.log("Decoded token: ", user); // debugging purpose

    req.userId = user.sub; // Attach the decoded user information to the request object for use in route handlers

    // Proceed to the route handler
    next();
  });
}

module.exports = authenticateToken;
