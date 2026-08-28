import type { Request, Response, NextFunction } from "express";

export function requireRootAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // Check if the user role is present. If not, the user is not authenticated properly.
  if (!req.user || !req.user.role) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  // Check if the user role is "admin" and user ID is 1 (root admin). If not, deny access.
  if (req.user.role !== "admin" || req.user.id !== 1) {
    res.status(403).json({
      error: "Forbidden: Only the root admin can perform this action",
    });
    return;
  }
  next();
}
