const db = require("../database/db.js");

db.run(`ALTER TABLE users ADD COLUMN is_demo INTEGER DEFAULT 0`, (err) => {
  if (err) {
    console.error("Error adding is_demo column to users table:", err.message);
  } else {
    console.log("is_demo column added successfully to users table.");
  }
});
