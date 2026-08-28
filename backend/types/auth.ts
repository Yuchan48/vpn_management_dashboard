import type { JwtPayload } from "jsonwebtoken";
import type { Request } from "express";

export interface AuthenticatedUser {
  id: number;
  role: string;
  is_demo: 0 | 1;
}

export interface AuthTokenPayload extends JwtPayload {
  sub: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
