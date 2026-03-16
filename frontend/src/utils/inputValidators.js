export function validateUsername(username) {
  if (username.length < 3) {
    return "Username must be at least 3 characters long.";
  }
  if (username.length > 20) {
    return "Username must be no more than 20 characters long.";
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return "Username can only contain letters, numbers, underscores, and hyphens.";
  }
  return null; // No errors
}

export function validatePassword(password) {
  if (password.length < 8) {
    return "Password must be at least 8 characters long.";
  }
  if (password.length > 100) {
    return "Password must be no more than 100 characters long.";
  }
  return null; // No errors
}
