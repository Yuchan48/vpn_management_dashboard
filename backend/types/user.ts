export interface User {
  id: number;
  username: string;
  role: "admin" | "user";
  is_demo: 0 | 1;
  created_at: Date | null;
}

export interface UserSummary {
  id: number;
  username: string;
  role: string;
  created_at: string;
}

export interface UserWithPassword extends User {
  password_hash: string;
}
