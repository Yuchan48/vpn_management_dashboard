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
  return !!getToken();
}
