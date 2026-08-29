import type { ApiErrorResponse } from "../types/api";

// For development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL + "/api";

// For production
// const API_BASE_URL = "/api";

type LoginResponse = {
  message: string;
};

export async function login(
  username: string,
  password: string,
): Promise<LoginResponse> {
  // Call the login API with the provided username and password
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const data: ApiErrorResponse = await response.json().catch(() => ({}));
    throw new Error(data.error || "Login failed");
  }
  // Parse the response JSON and check for errors
  const data: LoginResponse = await response.json();
  return data;
}

type LogoutResponse = {
  message: string;
};

export async function logout(): Promise<LogoutResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  const data: LogoutResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Logout failed");
  }
  return data;
}
