export async function changePassword(currentPassword, newPassword) {
  const token = getToken();
  if (!token) throw new Error("User not authenticated");
  // Call the change password API with the provided current and new passwords
  const response = await fetch(`${API_BASE_URL}/users/me/password`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      // Include the authentication token in the request headers
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
