export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthTokenPayload {
  sub: number;
  role: "user" | "admin";
}
