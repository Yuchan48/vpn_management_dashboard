export function validateUsername(username: string): string | undefined {
  if (username.length < 3 || username.length > 20) {
    return "Username must be between 3 and 20 characters long.";
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return "Username can only contain letters, numbers, underscores, and hyphens.";
  }
  return;
}

export function validatePassword(password: string): string | undefined {
  if (password.length < 8) {
    return "Password must be at least 8 characters long.";
  }
  if (password.length > 100) {
    return "Password must be no more than 100 characters long.";
  }
  return;
}

export function validateClientName(name: string): string | undefined {
  if (name.length < 5 || name.length > 15) {
    return "Client name must be between 5 and 15 characters long.";
  }

  if (!/^[a-zA-Z0-9-]+$/.test(name)) {
    return "Client name must contain only letters, numbers, or '-'";
  }
  return;
}
