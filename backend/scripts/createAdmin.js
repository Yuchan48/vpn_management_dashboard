// This is a one-off script to seed the initial admin user into the database.
require("dotenv").config();
const bcrypt = require("bcrypt");
const db = require("../database/db.js");

async function createAdmin() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  db.run(
    // Use a parameterized query to prevent SQL injection
    `INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)`,
    [username, hashedPassword, "admin"],
    (error) => {
      if (error) {
        // Check if the error is due to a UNIQUE constraint violation (i.e., user already exists)
        if (error.message.includes("UNIQUE constraint failed")) {
          console.log("Admin user already exists in the database.");
        } else {
          // Handle other potential errors
          console.error("Error inserting admin user into database:", error);
        }
      } else {
        console.log("Admin user created successfully.");
      }
    },
  );

  db.close();
}

createAdmin();
