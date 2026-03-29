const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");
// const { init } = require("../app");

const dbPath = process.env.DB_PATH || path.join(__dirname, "vpn.db");
const schemaPath = path.join(__dirname, "schema.sql");

const db = new sqlite3.Database(dbPath);

async function initDb() {
  // Enable foreign key constraints
  db.run("PRAGMA foreign_keys = ON", (err) => {
    if (err) {
      console.error("Failed to enable foreign keys:", err.message);
    }
  });

  // Read SQL schema from file
  const schema = fs.readFileSync(schemaPath, "utf-8");

  // Execute schema to create tables
  await new Promise((resolve, reject) => {
    db.exec(schema, (err) => {
      if (err) {
        console.error("Error initializing database schema:", err.message);
        return reject(err);
      }
      console.log("Database schema initialized successfully.");
      resolve();
    });
  });
}

module.exports = { db, initDb };
