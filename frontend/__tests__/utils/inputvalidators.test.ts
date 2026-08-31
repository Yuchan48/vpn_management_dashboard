import { describe, expect, it } from "vitest";

import {
  validateUsername,
  validatePassword,
  validateClientName,
} from "../../src/utils/inputValidators";

describe("inputValidators", () => {
  describe("validateUsername", () => {
    it("returns an error when the username is shorter than 3 characters", () => {
      expect(validateUsername("ab")).toBe(
        "Username must be between 3 and 20 characters long.",
      );
    });

    it("returns an error when the username contains invalid characters", () => {
      expect(validateUsername("test@user")).toBe(
        "Username can only contain letters, numbers, underscores, and hyphens.",
      );
    });

    it("returns undefined for a valid username", () => {
      expect(validateUsername("test_user-123")).toBeUndefined();
    });
  });

  describe("validatePassword", () => {
    it("returns an error when the password is shorter than 8 characters", () => {
      expect(validatePassword("1234567")).toBe(
        "Password must be at least 8 characters long.",
      );
    });

    it("returns an error when the password is longer than 100 characters", () => {
      const password = "a".repeat(101);

      expect(validatePassword(password)).toBe(
        "Password must be no more than 100 characters long.",
      );
    });

    it("returns undefined for a valid password", () => {
      expect(validatePassword("securePassword123")).toBeUndefined();
    });
  });

  describe("validateClientName", () => {
    it("returns an error when the client name is too short", () => {
      expect(validateClientName("abcd")).toBe(
        "Client name must be between 5 and 15 characters long.",
      );
    });

    it("returns an error when the client name contains invalid characters", () => {
      expect(validateClientName("my_client")).toBe(
        "Client name must contain only letters, numbers, or '-'",
      );
    });

    it("returns undefined for a valid client name", () => {
      expect(validateClientName("my-laptop")).toBeUndefined();
    });
  });
});
