// For development
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// For production
const API_BASE_URL = "/api";

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
    const params = new URLSearchParams();
    params.set("message", "Session expired. Please log in again.");

    window.location.href = `/login?${params.toString()}`;
    return;
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

export async function apiFetchBlob(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: "include",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "API request failed");
  }

  return await response.blob();
}
