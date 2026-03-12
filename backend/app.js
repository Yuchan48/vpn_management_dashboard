const express = require("express");

require("dotenv").config();
const cors = require("cors");
const app = express();

const errorHandler = require("./middleware/error.middleware");
const authenticateToken = require("./middleware/auth.middleware");

const clientRoutes = require("./routes/client.routes");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");

// Configure middleware
app.use(express.json());

app.use(
  cors({
    origin: process.env.REACT_APP_FRONTEND_URL,
    credentials: true,
  }),
);

// Mount routes at /clients
app.use("/clients", authenticateToken, clientRoutes);
// Mount auth routes at /auth
app.use("/api/auth", authRoutes);

app.use("/users", authenticateToken, userRoutes);

// Status endpoint for client status checks
app.get("/status", (req, res) => {
  res.json({ status: "Running", timestamp: new Date().toISOString() });
});

// Error handling middleware. This should be after all routes to catch any errors that occur in the route handlers.
app.use(errorHandler);

module.exports = app; // Export the app for testing
