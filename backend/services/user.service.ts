import bcrypt from "bcrypt";
import { db } from "../database/db.js";

import type { User } from "../types/user";
import type { AuthenticatedUser } from "../types/auth";
import type { AppError } from "../types/api";

// Get current user info by ID
export async function getUserById(userId: number): Promise<User> {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT id, username, role, created_at, is_demo FROM users WHERE id = ?",
      [userId],
      (err, row) => {
        if (err) return reject({ status: 500, error: err.message } as AppError);
        resolve(row as User);
      },
    );
  });
}

export async function createUser(
  username: string,
  password: string,
  isDemo: number,
): Promise<User> {
  // fetch all existing user ids to determine the next id.
  const userIdRows = await new Promise<{ id: number }[]>((resolve, reject) => {
    db.all(
      "SELECT id FROM users WHERE role = 'user' ORDER BY id",
      [],
      (err, rows) => {
        if (err) {
          reject({ status: 500, error: err.message } as AppError);
        } else if (rows.length >= 15) {
          // limit to 15 users. id 1 is reserved for initial admin. users will be assigned ids 2-16.
          reject({
            status: 400,
            error: "User limit reached. Cannot create more users.",
          } as AppError);
        } else {
          resolve(rows as { id: number }[]);
        }
      },
    );
  });

  // get the next available user id
  let nextUserId: number | undefined;
  for (let i = 2; i <= 16; i++) {
    if (!userIdRows.some((row) => row.id === i)) {
      nextUserId = i;
      break;
    }
  }

  if (nextUserId === undefined) {
    throw new Error("No available user ID found. Cannot create user.");
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await new Promise<void>((resolve, reject) => {
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
              } as AppError);
            }

            return reject({
              status: 500,
              error: "Failed to create user",
            } as AppError);
          } else {
            resolve();
          }
        },
      );
    });
  } catch (error) {
    throw error;
  }

  // return newly created user info
  return await getUserById(nextUserId);
}

export async function createAdmin(
  username: string,
  password: string,
): Promise<User> {
  // fetch all existing user ids to determine the next id.
  const adminIdRows = await new Promise<{ id: number }[]>((resolve, reject) => {
    db.all(
      "SELECT id FROM users WHERE role = 'admin' AND id != 1 ORDER BY id",
      [],
      (err, rows) => {
        if (err) {
          reject({ status: 500, error: err.message } as AppError);
        } else {
          resolve(rows as { id: number }[]);
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

  try {
    await new Promise<void>((resolve, reject) => {
      db.run(
        // Use a parameterized query to prevent SQL injection
        `INSERT INTO users (id, username, password_hash, role) VALUES (?, ?, ?, ?)`,
        [nextAdminId, username, hashedPassword, "admin"],
        (err) => {
          if (err) {
            if (
              err.message.includes("UNIQUE constraint failed: users.username")
            ) {
              return reject({
                status: 400,
                error: "Username already taken",
              } as AppError);
            }
            return reject({
              status: 500,
              error: "Failed to create user",
            } as AppError);
          } else {
            resolve();
          }
        },
      );
    });
  } catch (error) {
    throw error;
  }
  // return newly created user info
  return await getUserById(nextAdminId);
}

export async function createRootAdmin(
  username: string,
  password: string,
): Promise<User> {
  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);
  await new Promise<void>((resolve, reject) => {
    db.run(
      // Use a parameterized query to prevent SQL injection
      `INSERT INTO users (id, username, password_hash, role) VALUES (?, ?, ?, ?)`,
      [1, username, hashedPassword, "admin"],
      (error) => {
        if (error) {
          reject({ status: 500, error: error.message } as AppError);
        } else {
          resolve();
        }
      },
    );
  });
  // return newly created user info
  return await getUserById(1);
}

export async function getAllUsers(): Promise<User[]> {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT id, username, role, created_at FROM users ORDER BY id",
      [],
      (err, rows) => {
        if (err) {
          reject({ status: 500, error: err.message } as AppError);
        } else {
          resolve(rows as User[]);
        }
      },
    );
  });
}

export async function deleteUser(
  requestingUser: AuthenticatedUser,
  targetUserId: number,
): Promise<void> {
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
          return reject({ status: 500, error: err.message } as AppError);
        } else if (!targetUser) {
          return reject({ status: 404, error: "User not found" } as AppError);
        }
        db.run(
          "DELETE FROM users WHERE id = ?",
          [targetUserId],
          function (err) {
            if (err) {
              reject({ status: 500, error: err.message } as AppError);
            } else if (this.changes === 0) {
              reject({
                status: 404,
                error: "User not found or could not be deleted.",
              } as AppError);
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

export async function changePassword(
  user: AuthenticatedUser,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    db.get(
      "SELECT password_hash FROM users WHERE id = ?",
      [user.id],
      async (err, row: { password_hash: string } | undefined) => {
        if (err) {
          return reject({ status: 500, error: err.message } as AppError);
        } else if (!row) {
          return reject({ status: 404, error: "User not found" } as AppError);
        } else {
          const passwordMatch = await bcrypt.compare(
            currentPassword,
            row.password_hash,
          );
          if (!passwordMatch) {
            return reject({
              status: 400,
              error: "Current password is incorrect",
            } as AppError);
          } else {
            const newHashedPassword = await bcrypt.hash(newPassword, 10);
            db.run(
              "UPDATE users SET password_hash = ? WHERE id = ?",
              [newHashedPassword, user.id],
              function (err) {
                if (err) {
                  return reject({
                    status: 500,
                    error: err.message,
                  } as AppError);
                } else if (this.changes === 0) {
                  return reject({
                    status: 404,
                    error: "User not found or password not updated.",
                  } as AppError);
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
