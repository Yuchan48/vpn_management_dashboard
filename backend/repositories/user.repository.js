const { db } = require("../database/db.js");

// find user by username
async function findUserByUsername(username) {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
      if (err) {
        console.error("Database error:", err);
        return reject(err);
      }
      resolve(row);
    });
  });
}

module.exports = {
  findUserByUsername,
};
