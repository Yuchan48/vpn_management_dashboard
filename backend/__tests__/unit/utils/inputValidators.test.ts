import {
  validateUsername,
  validatePassword,
  validateClientName,
} from "../../../utils/inputValidators";

describe("validateUsername", () => {
  it("accepts a valid username", () => {
    expect(() => validateUsername("max123")).not.toThrow();
  });
  it("accepts underscores and hyphens", () => {
    expect(() => validateUsername("user_name")).not.toThrow();
    expect(() => validateUsername("user-name")).not.toThrow();
  });
  it("trims whitespace before validation", () => {
    expect(() => validateUsername(" max123 ")).not.toThrow();
  });
  it("rejects a username shorter than 3 characters", () => {
    expect(() => validateUsername("ab")).toThrow(
      "Username must be at least 3 characters",
    );
  });
  it("rejects a username with invalid characters", () => {
    expect(() => validateUsername("user@test")).toThrow(
      "Username can only contain letters, numbers, underscores, and hyphens",
    );
  });
  it("rejects undefined", () => {
    expect(() => validateUsername(undefined)).toThrow(
      "Username must be a string",
    );
  });
  it("rejects an empty username", () => {
    expect(() => validateUsername("")).toThrow(
      "Username must be at least 3 characters",
    );
  });
});
describe("validatePassword", () => {
  it("accepts a valid password", () => {
    expect(() => validatePassword("password123")).not.toThrow();
  });
  it("accepts a password with exactly 8 characters", () => {
    expect(() => validatePassword("12345678")).not.toThrow();
  });
  it("trims whitespace before validation", () => {
    expect(() => validatePassword(" password123 ")).not.toThrow();
  });
  it("rejects a password shorter than 8 characters", () => {
    expect(() => validatePassword("1234567")).toThrow(
      "Password must be at least 8 characters",
    );
  });
  it("rejects undefined", () => {
    expect(() => validatePassword(undefined)).toThrow(
      "Password must be a string",
    );
  });
  it("rejects an empty password", () => {
    expect(() => validatePassword("")).toThrow(
      "Password must be at least 8 characters",
    );
  });
});
describe("validateClientName", () => {
  it("accepts a valid client name", () => {
    expect(() => validateClientName("laptop")).not.toThrow();
  });
  it("accepts a client name with numbers and hyphens", () => {
    expect(() => validateClientName("laptop-01")).not.toThrow();
  });
  it("accepts a client name with exactly 5 characters", () => {
    expect(() => validateClientName("abcde")).not.toThrow();
  });
  it("accepts a client name with exactly 15 characters", () => {
    expect(() => validateClientName("abcdefghijklmno")).not.toThrow();
  });
  it("rejects an undefined client name", () => {
    expect(() => validateClientName(undefined)).toThrow(
      "Client name is required",
    );
  });
  it("rejects a client name shorter than 5 characters", () => {
    expect(() => validateClientName("abcd")).toThrow(
      "Client name must be 5-15 characters long and contain only letters, numbers, or '-'",
    );
  });
  it("rejects a client name longer than 15 characters", () => {
    expect(() => validateClientName("abcdefghijklmnop")).toThrow(
      "Client name must be 5-15 characters long and contain only letters, numbers, or '-'",
    );
  });
  it("rejects a client name with invalid characters", () => {
    expect(() => validateClientName("my_client")).toThrow(
      "Client name must be 5-15 characters long and contain only letters, numbers, or '-'",
    );
  });
});
