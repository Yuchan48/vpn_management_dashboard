import { jwtDecode } from "jwt-decode";

// Retrieve the token from localStorage
export function getToken() {
  return localStorage.getItem("authToken");
}

// Store the token in localStorage
export function setToken(token) {
  localStorage.setItem("authToken", token);
}

// Remove the token from localStorage
export function removeToken() {
  localStorage.removeItem("authToken");
}

// Check if the token exists in localStorage
export function isAuthenticated() {
  const token = getToken();
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000; // in seconds

    if (decoded.exp < currentTime) {
      removeToken();
      return false;
    }
    return true;
  } catch (err) {
    removeToken();
    console.error("Invalid token:", err);
    return false;
  }
}
