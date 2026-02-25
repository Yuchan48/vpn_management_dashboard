/*
Catches unhandled errors
Returns clean JSON responses
Prevents server crashes
Makes your backend look professional
*/

module.exports = (err, req, res, next) => {
  console.error(err.stack); // Log the error stack trace for debugging purposes

  // Send a JSON response with the error message and a 500 status code
  res.status(500).json({
    error: err.message || "Internal Server Error",
  });
};
