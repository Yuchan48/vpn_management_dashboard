// For development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL + "/api";

// For production
// const API_BASE_URL = "/api";

export async function apiFetch(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (response.status === 401) {
    const data = await response.json().catch(() => ({}));

    if (/AUTH/.test(data?.code)) {
      sessionStorage.setItem(
        "auth_error",
        data?.code === "TOKEN_INVALID"
          ? "Session expired. Please log in again."
          : "Unauthorized access. Please log in.",
      );
      window.location.href = "/login";
      return;
    } else {
      throw new Error(data?.error || "Authentication failed.");
    }
  }

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
