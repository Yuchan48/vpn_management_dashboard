export function validateUsername(username: string | undefined): void {
  if (typeof username !== "string") {
    throw new Error("Username must be a string");
  }

  username = username.trim();
  if (username.length < 3) {
    throw new Error("Username must be at least 3 characters");
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    throw new Error(
      "Username can only contain letters, numbers, underscores, and hyphens",
    );
  }
}

export function validatePassword(password: string | undefined): void {
  if (typeof password !== "string") {
    throw new Error("Password must be a string");
  }
  password = password.trim();
  // password must be minimum of 8 characters long.
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }
}

export function validateClientName(name: string | undefined): void {
  const regex = /^[a-zA-Z0-9-]{5,15}$/;
  if (!regex.test(name)) {
    throw new Error(
      "Client name must be 5-15 characters long and contain only letters, numbers, or '-'",
    );
  }
}
