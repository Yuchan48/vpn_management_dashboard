const rateLimit = require("express-rate-limit");

// Rate limiter for login attempts to prevent brute-force attacks
const loginRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 login attempts per minute
  message: {
    error: "Too many login attempts. Please try again later.",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

module.exports = {
  loginRateLimiter,
};
