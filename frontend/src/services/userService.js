import { getToken } from "../utils/auth";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/* Root Admin function */
export async function createAdmin(newAdminData, currentUser) {
  // check if the current user is authenticated
  const token = getToken();
  if (!token) throw new Error("User not authenticated");

  // check if the current user is root admin
  if (currentUser?.id !== 1) {
    throw new Error("Only root admin can create new admins");
  }

  // Call the create admin API with the provided new admin data
  const response = await fetch(`${API_BASE_URL}/users/admin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(newAdminData),
  });

  // Parse the response JSON and check for errors
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Create admin failed");
  }
  // data = { id, username, role }
  return data;
}

/* Admin functions */
export async function createUser(newUserData) {
  const token = getToken();
  if (!token) throw new Error("User not authenticated");

  const response = await fetch(`${API_BASE_URL}/users/user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(newUserData),
  });

  // Parse the response JSON and check for errors
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Create user failed");
  }
  // data = { id, username, role }
  return data;
}

export async function deleteUser(userId, currentUser) {
  const token = getToken();
  if (!token) throw new Error("User not authenticated");
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
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Check for errors
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Delete user failed");
  }

  return true;
}

export async function fetchAllUsers() {
  // check if the user is authenticated
  const token = getToken();
  if (!token) throw new Error("User not authenticated");

  // Call the get all users API
  const response = await fetch(`${API_BASE_URL}/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Parse the response JSON and check for errors
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch users");
  }

  return data; // data = [{ id, username, role, created_at }, ...]
}

/* User functions */
export async function changePassword(currentPassword, newPassword) {
  const token = getToken();
  if (!token) throw new Error("User not authenticated");
  // Call the change password API with the provided current and new passwords
  const response = await fetch(`${API_BASE_URL}/users/me/password`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  // Parse the response JSON and check for errors
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Change password failed");
  }

  return data;
}

export async function fetchCurrentUser() {
  // check if the user is authenticated
  const token = getToken();
  if (!token) throw new Error("User not authenticated");

  // Call the get current user API
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Parse the response JSON and check for errors
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch current user");
  }

  // data = { id, username, role, created_at }
  return data;
}
