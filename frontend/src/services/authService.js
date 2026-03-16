import { setToken } from "../utils/auth";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function login(username, password) {
  // Call the login API with the provided username and password
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  // Parse the response JSON and check for errors
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Login failed");
  }

  // set the token in localStorage
  setToken(data.token);
  return data;
}
