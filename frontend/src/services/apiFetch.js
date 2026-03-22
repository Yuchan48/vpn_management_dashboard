import { getToken } from "../utils/auth";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export async function apiFetch(endpoint, options = {}) {
  const token = getToken();

  if (!token) throw new Error("User not authenticated");

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  const contentType = response.headers.get("Content-Type");
  let data;
  if (contentType?.includes("application/json")) {
    data = await response.json();
  } else if (response.status === 204) {
    return null;
  } else if (contentType?.includes("text/plain")) {
    data = await response.text();
  } else {
    data = await response.blob(); // for .conf download
  }

  if (!response.ok) {
    throw new Error(data?.error || "API request failed");
  }

  return data;
}
