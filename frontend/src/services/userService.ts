import { apiFetch } from "./apiFetch";

// development
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// production
const API_BASE_URL = "/api";

import type { CreateUserRequest, User } from "../types/user";

/* Root Admin function */
export function createAdmin(
  newAdminData: CreateUserRequest,
  currentUser: User,
): Promise<User> {
  // check if the current user is root admin
  if (currentUser?.id !== 1) {
    throw new Error("Only root admin can create new admins");
  }

  return apiFetch("/users/admin", {
    method: "POST",
    body: JSON.stringify(newAdminData),
  });
}

/* Admin functions */
export function createUser(newUserData: CreateUserRequest): Promise<User> {
  return apiFetch("/users/user", {
    method: "POST",
    body: JSON.stringify(newUserData),
  });
}

export function deleteUser(userId: number, currentUser: User): Promise<void> {
  if (currentUser?.role === "user") {
    throw new Error("Regular users cannot delete any users");
  }
  if (userId === 1) {
    throw new Error("Root admin cannot be deleted");
  }

  // Only the root admin can delete other admins. Root admin is id = 1
  if (currentUser?.role === "admin" && currentUser?.id !== 1 && userId >= 17) {
    throw new Error("Only root admin can delete other admins");
  }

  // Call the delete user API with the provided user ID
  return apiFetch(`/users/${userId}`, {
    method: "DELETE",
  });
}

export function fetchAllUsers(): Promise<User[]> {
  return apiFetch("/users");
}

/* User functions */
export function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  // Call the change password API with the provided current and new passwords
  return apiFetch("/users/me/password", {
    method: "PATCH",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export async function fetchCurrentUser(): Promise<User | null> {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    credentials: "include",
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Failed to fetch current user");
  }

  return response.json();
}
