import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createAdmin,
  createUser,
  deleteUser,
  fetchAllUsers,
  changePassword,
  fetchCurrentUser,
} from "../../src/services/userService";

import { apiFetch } from "../../src/services/apiFetch";

import type { User } from "../../src/types/user";

vi.mock("../../src/services/apiFetch", () => ({
  apiFetch: vi.fn(),
}));

describe("userService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const rootAdmin: User = {
    id: 1,
    username: "root_admin",
    role: "admin",
    is_demo: 0,
    created_at: "2026-08-31",
  };

  const admin: User = {
    id: 17,
    username: "admin",
    role: "admin",
    is_demo: 0,
    created_at: "2026-08-31",
  };

  const regularUser: User = {
    id: 2,
    username: "user",
    role: "user",
    is_demo: 0,
    created_at: "2026-08-31",
  };

  describe("createAdmin", () => {
    it("allows the root admin to create an admin", async () => {
      const newAdmin = {
        username: "newadmin",
        password: "password123",
        role: "admin",
      };

      const createdUser: User = {
        id: 18,
        username: "newadmin",
        role: "admin",
        is_demo: 0,
        created_at: "2026-08-31",
      };

      vi.mocked(apiFetch).mockResolvedValue(createdUser);

      const result = await createAdmin(newAdmin, rootAdmin);

      expect(apiFetch).toHaveBeenCalledWith("/users/admin", {
        method: "POST",
        body: JSON.stringify(newAdmin),
      });

      expect(result).toEqual(createdUser);
    });

    it("rejects non-root admins from creating admins", () => {
      const newAdmin = {
        username: "newadmin",
        password: "password123",
        role: "admin",
      };

      expect(() => createAdmin(newAdmin, admin)).toThrow(
        "Only root admin can create new admins",
      );

      expect(apiFetch).not.toHaveBeenCalled();
    });
  });

  describe("createUser", () => {
    it("creates a user with the provided data", async () => {
      const newUser = {
        username: "newuser",
        password: "password123",
        role: "user",
      };

      const createdUser: User = {
        id: 3,
        username: "newuser",
        role: "user",
        is_demo: 0,
        created_at: "2026-08-31",
      };

      vi.mocked(apiFetch).mockResolvedValue(createdUser);

      const result = await createUser(newUser);

      expect(apiFetch).toHaveBeenCalledWith("/users/user", {
        method: "POST",
        body: JSON.stringify(newUser),
      });

      expect(result).toEqual(createdUser);
    });
  });

  describe("deleteUser", () => {
    it("rejects regular users from deleting users", () => {
      expect(() => deleteUser(3, regularUser)).toThrow(
        "Regular users cannot delete any users",
      );

      expect(apiFetch).not.toHaveBeenCalled();
    });

    it("prevents deletion of the root admin", () => {
      expect(() => deleteUser(1, rootAdmin)).toThrow(
        "Root admin cannot be deleted",
      );

      expect(apiFetch).not.toHaveBeenCalled();
    });

    it("prevents non-root admins from deleting other admins", () => {
      expect(() => deleteUser(18, admin)).toThrow(
        "Only root admin can delete other admins",
      );

      expect(apiFetch).not.toHaveBeenCalled();
    });

    it("allows the root admin to delete another admin", async () => {
      vi.mocked(apiFetch).mockResolvedValue(null);

      const result = await deleteUser(18, rootAdmin);

      expect(apiFetch).toHaveBeenCalledWith("/users/18", {
        method: "DELETE",
      });

      expect(result).toBeNull();
    });
  });

  describe("fetchAllUsers", () => {
    it("fetches all users", async () => {
      const users: User[] = [regularUser, admin];

      vi.mocked(apiFetch).mockResolvedValue(users);

      const result = await fetchAllUsers();

      expect(apiFetch).toHaveBeenCalledWith("/users");
      expect(result).toEqual(users);
    });
  });

  describe("changePassword", () => {
    it("sends the current and new passwords", async () => {
      vi.mocked(apiFetch).mockResolvedValue(null);

      const result = await changePassword("oldPassword", "newPassword");

      expect(apiFetch).toHaveBeenCalledWith("/users/me/password", {
        method: "PATCH",
        body: JSON.stringify({
          currentPassword: "oldPassword",
          newPassword: "newPassword",
        }),
      });

      expect(result).toBeNull();
    });
  });

  describe("fetchCurrentUser", () => {
    it("fetches the current user", async () => {
      vi.mocked(apiFetch).mockResolvedValue(regularUser);

      const result = await fetchCurrentUser();

      expect(apiFetch).toHaveBeenCalledWith("/users/me");
      expect(result).toEqual(regularUser);
    });
  });
});
