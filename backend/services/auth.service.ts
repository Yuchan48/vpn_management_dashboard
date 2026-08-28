const DUMMY_PASSWORD_HASH =
  "$2b$10$NRAJfG4vQVirNN1TjeZUyuWFXccY8zk12pF7t9djrPJH691uyYouq"; // bcrypt hash for "dummy_password"

import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";
import { db } from "../database/db.js";

import type { User, UserWithPassword } from "../types/user.js";
import type { StringValue } from "ms";

type loginUserResponse = {
  token: string;
  user: User;
};

export async function loginUser(
  username: string,
  password: string,
): Promise<loginUserResponse> {
  if (!username || !password) {
    throw { error: "Username and password are required", status: 400 };
  }

  // Fetch user from the database
  const user = await findUserByUsername(username);

  // If user not found, use a dummy hash to prevent timing attacks
  const passwordHash = user ? user.password_hash : DUMMY_PASSWORD_HASH;

  // Compare the provided password with the stored hash
  const isMatch = await bcrypt.compare(password, passwordHash);

  if (!user || !isMatch) {
    throw { error: "Invalid login information", status: 401 };
  }

  const expiresIn: SignOptions["expiresIn"] =
    (process.env.JWT_EXPIRES_IN as StringValue) || "1h";

  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  // Generate JWT token
  const token = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: expiresIn,
    issuer: "personal-vpn-backend",
  });

  const { password_hash, ...userWithoutPassword } = user;

  return { token, user: userWithoutPassword };
}

// find user by username
async function findUserByUsername(
  username: string,
): Promise<UserWithPassword | undefined> {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
      if (err) {
        console.error("Database error:", err);
        return reject(err);
      }
      resolve(row as UserWithPassword | undefined);
    });
  });
}
