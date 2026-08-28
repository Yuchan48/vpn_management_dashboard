import dotenv from "dotenv";

dotenv.config({
  path:
    process.env.NODE_ENV === "production"
      ? `${__dirname}/.env.production`
      : `${__dirname}/.env.development`,
});

import express from "express";

import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();

import errorHandler from "./middleware/error.middleware";
import { authenticateToken } from "./middleware/auth.middleware";

import clientRoutes from "./routes/client.routes";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";

// Configure middleware
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.REACT_APP_FRONTEND_URL,
    credentials: true,
  }),
);

// Mount routes at /api/clients
app.use("/api/clients", authenticateToken, clientRoutes);
// Mount auth routes at /api/auth
app.use("/api/auth", authRoutes);
// Mount user routes at /api/users
app.use("/api/users", authenticateToken, userRoutes);

// Status endpoint for client status checks
app.get("/status", (req, res) => {
  res.json({ status: "Running", timestamp: new Date().toISOString() });
});

// Error handling middleware. This should be after all routes to catch any errors that occur in the route handlers.
app.use(errorHandler);

export default app;
