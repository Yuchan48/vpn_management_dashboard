import { apiFetch } from "./apiFetch";
// For development
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// For production
const API_BASE_URL = "/api";

/* Root Admin function */
export function createAdmin(newAdminData, currentUser) {
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
export function createUser(newUserData) {
  return apiFetch("/users/user", {
    method: "POST",
    body: JSON.stringify(newUserData),
  });
}

export function deleteUser(userId, currentUser) {
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

export function fetchAllUsers() {
  return apiFetch("/users");
}

/* User functions */
export function changePassword(currentPassword, newPassword) {
  // Call the change password API with the provided current and new passwords
  return apiFetch("/users/me/password", {
    method: "PATCH",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export function fetchCurrentUser() {
  return apiFetch("/users/me");
}
