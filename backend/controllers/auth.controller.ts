import type { Request, Response, NextFunction } from "express";

import { loginUser } from "../services/auth.service";

export async function login(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { username, password } = req.body;

    // login validation and token generation
    const { token } = await loginUser(username, password);

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // HTTPS only in production
        sameSite: "strict",
        maxAge: 1000 * 60 * 60, // 1 hour
      })
      .json({ message: "Login successful" });

    return;
  } catch (error) {
    next(error);
  }
}
