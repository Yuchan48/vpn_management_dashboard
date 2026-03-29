// error.middleware.js
module.exports = (err, req, res, next) => {
  // Log only meaningful info
  if (err.status && err.error) {
    // your service-style error object
    console.error("Error:", err.error);
  } else if (err.message) {
    // native Error object from validators
    console.error("Error:", err.message);
  } else {
    console.error(err);
  }

  // Send JSON response
  res.status(err.status || 400).json({
    error: err.error || err.message || "Internal Server Error",
  });
};
