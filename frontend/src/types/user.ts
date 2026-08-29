export interface User {
  id: number;
  username: string;
  role: "user" | "admin";
  is_demo: number;
  created_at: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  role: string;
}
