const bcrypt = require("bcrypt");
const db = require("../database/db.js");

async function createUser(username, password) {
  // fetch all existing user ids to determine the next id.
  const userIdRows = await new Promise((resolve, reject) => {
    db.all(
      "SELECT id FROM users WHERE role = 'user' ORDER BY id",
      [],
      (err, rows) => {
        if (err) {
          reject(err);
        } else if (rows.length >= 15) {
          // limit to 15 users. id 1 is reserved for initial admin. users will be assigned ids 2-16.
          reject(new Error("User limit reached. Cannot create more users."));
        } else {
          resolve(rows);
        }
      },
    );
  });

  // get the next available user id
  let nextUserId = null;
  for (let i = 2; i <= 16; i++) {
    if (!userIdRows.some((row) => row.id === i)) {
      nextUserId = i;
      break;
    }
  }

  if (nextUserId === null) {
    throw new Error("No available user ID found. Cannot create user.");
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  return await new Promise((resolve, reject) => {
    db.run(
      // Use a parameterized query to prevent SQL injection
      `INSERT INTO users (id, username, password_hash, role) VALUES (?, ?, ?, ?)`,
      [nextUserId, username, hashedPassword, "user"],
      function (error) {
        if (error) {
          reject(error);
        } else {
          console.log(
            `User ${username} with ID ${nextUserId} created successfully`,
          );
          resolve({
            id: nextUserId,
            username,
            role: "user",
          });
        }
      },
    );
  });
}

async function createAdmin(username, password) {
  // fetch all existing user ids to determine the next id.
  const adminIdRows = await new Promise((resolve, reject) => {
    db.all(
      "SELECT id FROM users WHERE role = 'admin' AND id != 1 ORDER BY id",
      [],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      },
    );
  });

  // get the next available user id for admin users (starting from 17 to avoid conflict with regular users)
  let nextAdminId = 17;
  while (adminIdRows.some((row) => row.id === nextAdminId)) {
    nextAdminId++;
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  return new Promise((resolve, reject) => {
    db.run(
      // Use a parameterized query to prevent SQL injection
      `INSERT INTO users (id, username, password_hash, role) VALUES (?, ?, ?, ?)`,
      [nextAdminId, username, hashedPassword, "admin"],
      (error) => {
        if (error) {
          reject(error);
        } else {
          console.log(
            `Admin ${username} with ID ${nextAdminId} created successfully`,
          );
          resolve({
            id: nextAdminId,
            username,
            role: "admin",
          });
        }
      },
    );
  });
}

async function getAllUsers() {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT id, username, role, created_at FROM users ORDER BY id",
      [],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      },
    );
  });
}

// Get current user info by ID
async function getUserById(userId) {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT id, username, role, created_at FROM users WHERE id = ?",
      [userId],
      (err, row) => {
        if (err) return reject(err);
        resolve(row);
      },
    );
  });
}

async function deleteUser(requestingUser, targetUserId) {
  // Prevent deletion of the initial admin user (id 1)
  if (targetUserId === 1) {
    throw new Error("Cannot delete the initial admin user.");
  }

  // the regular admins don't have the permission to delete other admins. only the initial admin (id 1) can delete other admins.
  if (requestingUser.id !== 1 && targetUserId >= 17) {
    throw new Error("Only the initial admin can delete other admin users.");
  }

  return new Promise((resolve, reject) => {
    db.get(
      "SELECT id FROM users WHERE id = ?",
      [targetUserId],
      (err, targetUser) => {
        if (err) {
          return reject(err);
        } else if (!targetUser) {
          return reject(new Error("User not found."));
        }
        db.run(
          "DELETE FROM users WHERE id = ?",
          [targetUserId],
          function (err) {
            if (err) {
              reject(err);
            } else if (this.changes === 0) {
              reject(new Error("User not found or could not be deleted."));
            } else {
              console.log(`User with ID ${targetUserId} deleted successfully`);
              resolve();
            }
          },
        );
      },
    );
  });
}

async function changePassword(user, currentPassword, newPassword) {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT password_hash FROM users WHERE id = ?",
      [user.id],
      async (err, row) => {
        if (err) {
          return reject(err);
        } else if (!row) {
          return reject(new Error("User not found."));
        } else {
          const passwordMatch = await bcrypt.compare(
            currentPassword,
            row.password_hash,
          );
          if (!passwordMatch) {
            return reject(new Error("Current password is incorrect."));
          } else {
            const newHashedPassword = await bcrypt.hash(newPassword, 10);
            db.run(
              "UPDATE users SET password_hash = ? WHERE id = ?",
              [newHashedPassword, user.id],
              function (err) {
                if (err) {
                  return reject(err);
                } else if (this.changes === 0) {
                  return reject(
                    new Error("User not found or password not updated."),
                  );
                } else {
                  console.log(
                    `Password for user with ID ${user.id} updated successfully`,
                  );
                  resolve();
                }
              },
            );
          }
        }
      },
    );
  });
}

module.exports = {
  createUser,
  createAdmin,
  getAllUsers,
  getUserById,
  deleteUser,
  changePassword,
};
