const bcrypt = require("bcrypt");
const db = require("../database/db.js");

async function createUser(username, password, isDemo) {
  // fetch all existing user ids to determine the next id.
  const userIdRows = await new Promise((resolve, reject) => {
    db.all(
      "SELECT id FROM users WHERE role = 'user' ORDER BY id",
      [],
      (err, rows) => {
        if (err) {
          if (
            err.message.includes("UNIQUE constraint failed: users.username")
          ) {
            return reject({
              status: 400,
              error: "Username already taken",
            });
          }

          return reject({
            status: 500,
            error: "Failed to create user",
          });
        } else if (rows.length >= 15) {
          // limit to 15 users. id 1 is reserved for initial admin. users will be assigned ids 2-16.
          reject({
            status: 400,
            error: "User limit reached. Cannot create more users.",
          });
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

  await new Promise((resolve, reject) => {
    // create a new user
    db.run(
      // Use a parameterized query to prevent SQL injection
      `INSERT INTO users (id, username, password_hash, role, is_demo) VALUES (?, ?, ?, ?, ?)`,
      [nextUserId, username, hashedPassword, "user", isDemo],
      function (err) {
        if (err) {
          if (
            err.message.includes("UNIQUE constraint failed: users.username")
          ) {
            return reject({
              status: 400,
              error: "Username already taken",
            });
          }

          return reject({
            status: 500,
            error: "Failed to create user",
          });
        } else {
          resolve();
        }
      },
    );
  });

  // return newly created user info
  return await getUserById(nextUserId);
}

async function createAdmin(username, password) {
  // fetch all existing user ids to determine the next id.
  const adminIdRows = await new Promise((resolve, reject) => {
    db.all(
      "SELECT id FROM users WHERE role = 'admin' AND id != 1 ORDER BY id",
      [],
      (err, rows) => {
        if (err) {
          reject({ status: 500, error: err.message });
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

  await new Promise((resolve, reject) => {
    db.run(
      // Use a parameterized query to prevent SQL injection
      `INSERT INTO users (id, username, password_hash, role) VALUES (?, ?, ?, ?)`,
      [nextAdminId, username, hashedPassword, "admin"],
      (error) => {
        if (error) {
          reject({ status: 500, error: error.message });
        } else {
          resolve();
        }
      },
    );
  });

  // return newly created user info
  return await getUserById(nextAdminId);
}

async function getAllUsers() {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT id, username, role, created_at FROM users ORDER BY id",
      [],
      (err, rows) => {
        if (err) {
          reject({ status: 500, error: err.message });
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
      "SELECT id, username, role, created_at, is_demo FROM users WHERE id = ?",
      [userId],
      (err, row) => {
        if (err) return reject({ status: 500, error: err.message });
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
          return reject({ status: 500, error: err.message });
        } else if (!targetUser) {
          return reject({ status: 404, error: "User not found" });
        }
        db.run(
          "DELETE FROM users WHERE id = ?",
          [targetUserId],
          function (err) {
            if (err) {
              reject({ status: 500, error: err.message });
            } else if (this.changes === 0) {
              reject({
                status: 404,
                error: "User not found or could not be deleted.",
              });
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
          return reject({ status: 500, error: err.message });
        } else if (!row) {
          return reject({ status: 404, error: "User not found" });
        } else {
          const passwordMatch = await bcrypt.compare(
            currentPassword,
            row.password_hash,
          );
          if (!passwordMatch) {
            return reject({
              status: 400,
              error: "Current password is incorrect",
            });
          } else {
            const newHashedPassword = await bcrypt.hash(newPassword, 10);
            db.run(
              "UPDATE users SET password_hash = ? WHERE id = ?",
              [newHashedPassword, user.id],
              function (err) {
                if (err) {
                  return reject({ status: 500, error: err.message });
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
