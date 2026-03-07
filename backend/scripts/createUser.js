require("dotenv").config();
const bcrypt = require("bcrypt");
const db = require("../database/db.js");

async function createUser() {
  const username = process.env.USER_USERNAME;
  const password = process.env.USER_PASSWORD;

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  db.run(
    // Use a parameterized query to prevent SQL injection
    `INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)`,
    [username, hashedPassword, "user"],
    function (error) {
      if (error) {
        console.error("Error creating user:", error);
      } else {
        console.log(`User ${username} created successfully with role user.`);
      }
    },
  );

  db.close();
}

createUser();
