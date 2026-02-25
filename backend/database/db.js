/*
db.js
Connects to SQLite and initializes the database.
Responsibilities:
- Open DB connection
- Apply schema from schema.sql
- Export database instance
*/

const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");

const schemaPath = path.join(__dirname, "schema.sql");

// Create database instance
const db = new sqlite3.Database("./vpn.db", (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to the SQLite database.");

    // Read SQL schema from file
    const schema = fs.readFileSync("./schema.sql", "utf-8");

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
