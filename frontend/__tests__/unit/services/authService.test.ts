import { beforeEach, describe, expect, it, vi } from "vitest";

import { login, logout } from "../../../src/services/authService";

describe("authService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("login", () => {
    it("sends login credentials and returns the response", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(
          JSON.stringify({
            message: "Login successful",
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          },
        ),
      );

      const result = await login("testuser", "password123");

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/auth/login"),
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "testuser",
            password: "password123",
          }),
        },
      );

      expect(result).toEqual({
        message: "Login successful",
      });
    });

    it("throws the API error when login fails", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(
          JSON.stringify({
            error: "Invalid username or password",
          }),
          {
            status: 401,
            headers: {
              "Content-Type": "application/json",
            },
          },
        ),
      );

      await expect(login("testuser", "wrong")).rejects.toThrow(
        "Invalid username or password",
      );
    });
  });

  describe("logout", () => {
    it("sends the logout request and returns the response", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(
          JSON.stringify({
            message: "Logout successful",
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          },
        ),
      );

      const result = await logout();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/auth/logout"),
        {
          method: "POST",
          credentials: "include",
        },
      );

      expect(result).toEqual({
        message: "Logout successful",
      });
    });

    it("throws an error when logout fails", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(
          JSON.stringify({
            message: "Logout failed",
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
            },
          },
        ),
      );

      await expect(logout()).rejects.toThrow("Logout failed");
    });
  });
});
