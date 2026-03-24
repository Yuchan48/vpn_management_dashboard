const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "vpn.db");
const schemaPath = path.join(__dirname, "schema.sql");

// Create database instance
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to the SQLite database.");

    // Enable foreign key constraints
    db.run("PRAGMA foreign_keys = ON", (err) => {
      if (err) {
        console.error("Failed to enable foreign keys:", err.message);
      }
    });

    // Read SQL schema from file
    const schema = fs.readFileSync(schemaPath, "utf-8");

    // Execute schema to create tables
    db.exec(schema, (err) => {
      if (err) {
        console.error("Error initializing database schema:", err.message);
      } else {
        console.log("Database schema initialized successfully.");
      }
    });
  }
});

module.exports = db;
