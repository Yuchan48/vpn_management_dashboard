import type { ApiErrorResponse } from "../types/api";

// For development
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// For production
const API_BASE_URL = "/api";

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (response.status === 401) {
    const data: ApiErrorResponse = await response.json().catch(() => ({}));

    if (data.code && /AUTH/.test(data.code)) {
      sessionStorage.setItem(
        "auth_error",
        data?.code === "TOKEN_INVALID"
          ? "Session expired. Please log in again."
          : "Unauthorized access. Please log in.",
      );
      window.location.href = "/login";
      throw new Error("Authentication required");
    } else {
      throw new Error(data?.error || "Authentication failed.");
    }
  }

  const contentType = response.headers.get("Content-Type");

  let data: T;

  if (contentType?.includes("application/json")) {
    data = (await response.json()) as T;
  } else if (contentType?.includes("text/plain")) {
    data = (await response.text()) as T;
  } else {
    data = (await response.blob()) as T; // for .conf download
  }

  // handle other HTTP errors
  if (!response.ok) {
    throw new Error((data as ApiErrorResponse)?.error || "API request failed");
  }

  return data;
}
