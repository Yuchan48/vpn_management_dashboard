import sqlite3 from "sqlite3";
sqlite3.verbose();
import fs from "fs";
import path from "path";

const dbPath = process.env.DB_PATH || path.join(__dirname, "vpn.db");

const schemaPath = path.join(__dirname, "schema.sql");

export const db = new sqlite3.Database(dbPath);

export async function initDb(): Promise<void> {
  // Enable foreign key constraints
  db.run("PRAGMA foreign_keys = ON", (err) => {
    if (err) {
      console.error("Failed to enable foreign keys:", err.message);
    }
  });

  // Read SQL schema from file
  const schema = fs.readFileSync(schemaPath, "utf-8");

  // Execute schema to create tables
  await new Promise<void>((resolve, reject) => {
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
