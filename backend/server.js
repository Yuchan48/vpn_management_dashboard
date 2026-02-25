/*
- Configure middleware
- Mount routes
- Start the server
*/

const express = require("express");
require("dotenv").config();
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5500;

app.use(express.json());

app.use(
  cors({
    origin: process.env.REACT_APP_FRONTEND_URL,
    credentials: true,
  }),
);

app.get("/status", (req, res) => {
  res.json({ status: "Running", timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

/*
include error handling
*/

app.get("/clients", (req, res) => {});

app.post("/clients", (req, res) => {});

app.delete("/clients/:id", (req, res) => {});
