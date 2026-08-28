import type { Request, Response, NextFunction } from "express";

import jwt from "jsonwebtoken";
import type { AuthTokenPayload } from "../types/auth";

// Middleware to authenticate JWT tokens in incoming requests
export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction,
): Response | void {
  const token = req.cookies.token; // Get token from cookies
  if (!token) {
    return res
      .status(401)
      .json({ error: "Token missing", code: "TOKEN_MISSING" });
  }

  // Verify the token
  jwt.verify(
    token,
    process.env.JWT_SECRET,
    { issuer: "personal-vpn-backend" },
    (err, decoded) => {
      if (err) {
        console.log("JWT ERROR:", err.message);
        return res
          .status(401)
          .json({ error: "Invalid token", code: "TOKEN_INVALID" });
      }

      const user = decoded as AuthTokenPayload;
      // Attach user info to the request object for use in route handlers
      req.user = {
        id: Number(user.sub),
        role: user.role,
        is_demo: user.is_demo,
      };

      // Proceed to the route handler
      next();
    },
  );
}
