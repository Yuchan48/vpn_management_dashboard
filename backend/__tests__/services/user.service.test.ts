import bcrypt from "bcrypt";

import {
  getUserById,
  createUser,
  createAdmin,
  getAllUsers,
  deleteUser,
  changePassword,
} from "../../services/user.service";

import { db } from "../../database/db";

import type { User } from "../../types/user";
import type { AuthenticatedUser } from "../../types/auth";

jest.mock("bcrypt");
jest.mock("../../database/db");

const mockedBcrypt = jest.mocked(bcrypt);
const mockedDb = jest.mocked(db);

describe("user.service", () => {
  const mockUser: User = {
    id: 2,
    username: "testuser",
    role: "user",
    is_demo: 0,
    created_at: new Date("2026-08-30T12:00:00Z"),
  };

  const mockAdmin: User = {
    id: 17,
    username: "testadmin",
    role: "admin",
    is_demo: 0,
    created_at: new Date("2026-08-30T12:00:00Z"),
  };

  const authenticatedUser: AuthenticatedUser = {
    id: 2,
    role: "user",
    is_demo: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockedBcrypt.hash.mockImplementation(
      async (): Promise<string> => "hashed-password",
    );

    mockedBcrypt.compare.mockImplementation(async (): Promise<boolean> => true);
  });

  describe("getUserById", () => {
    it("should return a user by ID", async () => {
      mockedDb.get.mockImplementation(
        (
          _sql: string,
          _params: unknown[],
          callback: (err: Error | null, row?: unknown) => void,
        ) => {
          callback(null, mockUser);
          return mockedDb;
        },
      );

      const result = await getUserById(2);

      expect(result).toEqual(mockUser);

      expect(mockedDb.get).toHaveBeenCalledWith(
        "SELECT id, username, role, created_at, is_demo FROM users WHERE id = ?",
        [2],
        expect.any(Function),
      );
    });

    it("should reject when the database query fails", async () => {
      const databaseError = new Error("Database error");

      mockedDb.get.mockImplementation(
        (
          _sql: string,
          _params: unknown[],
          callback: (err: Error | null, row?: unknown) => void,
        ) => {
          callback(databaseError);
          return mockedDb;
        },
      );

      await expect(getUserById(2)).rejects.toEqual({
        status: 500,
        error: "Database error",
      });
    });
  });

  describe("createUser", () => {
    it("should create a user with the next available ID", async () => {
      mockedDb.all.mockImplementation(
        (
          _sql: string,
          _params: unknown[],
          callback: (err: Error | null, rows?: unknown[]) => void,
        ) => {
          callback(null, [{ id: 2 }, { id: 3 }]);
          return mockedDb;
        },
      );

      mockedDb.run.mockImplementation(
        (
          _sql: string,
          _params: unknown[],
          callback: (err: Error | null) => void,
        ) => {
          callback(null);
          return mockedDb;
        },
      );

      mockedDb.get.mockImplementation(
        (
          _sql: string,
          _params: unknown[],
          callback: (err: Error | null, row?: unknown) => void,
        ) => {
          callback(null, {
            ...mockUser,
            id: 4,
          });
          return mockedDb;
        },
      );

      const result = await createUser("testuser", "password123", 0);

      expect(result).toEqual({
        ...mockUser,
        id: 4,
      });

      expect(mockedBcrypt.hash).toHaveBeenCalledWith("password123", 10);

      expect(mockedDb.run).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO users"),
        [4, "testuser", "hashed-password", "user", 0],
        expect.any(Function),
      );
    });

    it("should reject when the user limit is reached", async () => {
      const existingUsers = Array.from({ length: 15 }, (_, index) => ({
        id: index + 2,
      }));

      mockedDb.all.mockImplementation(
        (
          _sql: string,
          _params: unknown[],
          callback: (err: Error | null, rows?: unknown[]) => void,
        ) => {
          callback(null, existingUsers);
          return mockedDb;
        },
      );

      await expect(createUser("testuser", "password123", 0)).rejects.toEqual({
        status: 400,
        error: "User limit reached. Cannot create more users.",
      });

      expect(mockedBcrypt.hash).not.toHaveBeenCalled();
      expect(mockedDb.run).not.toHaveBeenCalled();
    });

    it("should reject when the database query fails", async () => {
      mockedDb.all.mockImplementation(
        (
          _sql: string,
          _params: unknown[],
          callback: (err: Error | null, rows?: unknown[]) => void,
        ) => {
          callback(new Error("Database error"));
          return mockedDb;
        },
      );

      await expect(createUser("testuser", "password123", 0)).rejects.toEqual({
        status: 500,
        error: "Database error",
      });
    });

    it("should reject when the username already exists", async () => {
      mockedDb.all.mockImplementation(
        (
          _sql: string,
          _params: unknown[],
          callback: (err: Error | null, rows?: unknown[]) => void,
        ) => {
          callback(null, []);
          return mockedDb;
        },
      );

      mockedDb.run.mockImplementation(
        (
          _sql: string,
          _params: unknown[],
          callback: (err: Error | null) => void,
        ) => {
          callback(new Error("UNIQUE constraint failed: users.username"));
          return mockedDb;
        },
      );

      await expect(createUser("testuser", "password123", 0)).rejects.toEqual({
        status: 400,
        error: "Username already taken",
      });
    });
  });

  describe("createAdmin", () => {
    it("should create an admin with the next available admin ID", async () => {
      mockedDb.all.mockImplementation(
        (
          _sql: string,
          _params: unknown[],
          callback: (err: Error | null, rows?: unknown[]) => void,
        ) => {
          callback(null, [{ id: 17 }, { id: 18 }]);
          return mockedDb;
        },
      );

      mockedDb.run.mockImplementation(
        (
          _sql: string,
          _params: unknown[],
          callback: (err: Error | null) => void,
        ) => {
          callback(null);
          return mockedDb;
        },
      );

      mockedDb.get.mockImplementation(
        (
          _sql: string,
          _params: unknown[],
          callback: (err: Error | null, row?: unknown) => void,
        ) => {
          callback(null, mockAdmin);
          return mockedDb;
        },
      );

      const result = await createAdmin("testadmin", "password123");

      expect(result).toEqual(mockAdmin);

      expect(mockedBcrypt.hash).toHaveBeenCalledWith("password123", 10);

      expect(mockedDb.run).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO users"),
        [19, "testadmin", "hashed-password", "admin"],
        expect.any(Function),
      );
    });

    it("should start assigning admin IDs from 17", async () => {
      mockedDb.all.mockImplementation(
        (
          _sql: string,
          _params: unknown[],
          callback: (err: Error | null, rows?: unknown[]) => void,
        ) => {
          callback(null, []);
          return mockedDb;
        },
      );

      mockedDb.run.mockImplementation(
        (
          _sql: string,
          _params: unknown[],
          callback: (err: Error | null) => void,
        ) => {
          callback(null);
          return mockedDb;
        },
      );

      mockedDb.get.mockImplementation(
        (
          _sql: string,
          _params: unknown[],
          callback: (err: Error | null, row?: unknown) => void,
        ) => {
          callback(null, {
            ...mockAdmin,
            id: 17,
          });
          return mockedDb;
        },
      );

      await createAdmin("testadmin", "password123");

      expect(mockedDb.run).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO users"),
        [17, "testadmin", "hashed-password", "admin"],
        expect.any(Function),
      );
    });

    it("should reject when the admin username already exists", async () => {
      mockedDb.all.mockImplementation(
        (
          _sql: string,
          _params: unknown[],
          callback: (err: Error | null, rows?: unknown[]) => void,
        ) => {
          callback(null, []);
          return mockedDb;
        },
      );

      mockedDb.run.mockImplementation(
        (
          _sql: string,
          _params: unknown[],
          callback: (err: Error | null) => void,
        ) => {
          callback(new Error("UNIQUE constraint failed: users.username"));
          return mockedDb;
        },
      );

      await expect(createAdmin("testadmin", "password123")).rejects.toEqual({
        status: 400,
        error: "Username already taken",
      });
    });
  });

  describe("getAllUsers", () => {
    it("should return all users", async () => {
      const users: User[] = [mockUser, mockAdmin];

      mockedDb.all.mockImplementation(
        (
          _sql: string,
          _params: unknown[],
          callback: (err: Error | null, rows?: unknown[]) => void,
        ) => {
          callback(null, users);
          return mockedDb;
        },
      );

      const result = await getAllUsers();

      expect(result).toEqual(users);

      expect(mockedDb.all).toHaveBeenCalledWith(
        "SELECT id, username, role, created_at FROM users ORDER BY id",
        [],
        expect.any(Function),
      );
    });

    it("should reject when the database query fails", async () => {
      mockedDb.all.mockImplementation(
        (
          _sql: string,
          _params: unknown[],
          callback: (err: Error | null, rows?: unknown[]) => void,
        ) => {
          callback(new Error("Database error"));
          return mockedDb;
        },
      );

      await expect(getAllUsers()).rejects.toEqual({
        status: 500,
        error: "Database error",
      });
    });
  });

  describe("deleteUser", () => {
    it("should not allow deletion of the root admin", async () => {
      await expect(deleteUser(authenticatedUser, 1)).rejects.toThrow(
        "Cannot delete the initial admin user.",
      );

      expect(mockedDb.get).not.toHaveBeenCalled();
    });

    it("should not allow a regular admin to delete another admin", async () => {
      const regularAdmin: AuthenticatedUser = {
        id: 17,
        role: "admin",
        is_demo: 0,
      };

      await expect(deleteUser(regularAdmin, 18)).rejects.toThrow(
        "Only the initial admin can delete other admin users.",
      );

      expect(mockedDb.get).not.toHaveBeenCalled();
    });

    it("should return an error when the target user does not exist", async () => {
      mockedDb.get.mockImplementation(
        (
          _sql: string,
          _params: unknown[],
          callback: (err: Error | null, row?: unknown) => void,
        ) => {
          callback(null, undefined);
          return mockedDb;
        },
      );

      await expect(deleteUser(authenticatedUser, 5)).rejects.toEqual({
        status: 404,
        error: "User not found",
      });

      expect(mockedDb.run).not.toHaveBeenCalled();
    });

    it("should delete a user successfully", async () => {
      mockedDb.get.mockImplementation(
        (
          _sql: string,
          _params: unknown[],
          callback: (err: Error | null, row?: unknown) => void,
        ) => {
          callback(null, { id: 5 });
          return mockedDb;
        },
      );

      mockedDb.run.mockImplementation(function (
        this: { changes: number },
        _sql: string,
        _params: unknown[],
        callback: (this: { changes: number }, err: Error | null) => void,
      ) {
        callback.call({ changes: 1 }, null);
        return mockedDb;
      });

      await deleteUser(authenticatedUser, 5);

      expect(mockedDb.run).toHaveBeenCalledWith(
        "DELETE FROM users WHERE id = ?",
        [5],
        expect.any(Function),
      );
    });
  });

  describe("changePassword", () => {
    const user: AuthenticatedUser = {
      id: 2,
      role: "user",
      is_demo: 0,
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should reject when user is not found", async () => {
      mockedDb.get.mockImplementation(
        (
          _sql: string,
          _params: unknown[],
          callback: (err: null, row: undefined) => void,
        ) => {
          callback(null, undefined);
          return mockedDb;
        },
      );

      await expect(
        changePassword(user, "currentPassword", "newPassword"),
      ).rejects.toEqual({
        status: 404,
        error: "User not found",
      });

      expect(mockedBcrypt.compare).not.toHaveBeenCalled();
      expect(mockedDb.run).not.toHaveBeenCalled();
    });

    it("should reject when current password is incorrect", async () => {
      mockedDb.get.mockImplementation(
        (
          _sql: string,
          _params: unknown[],
          callback: (err: null, row: { password_hash: string }) => void,
        ) => {
          callback(null, {
            password_hash: "hashed-password",
          });
          return mockedDb;
        },
      );

      mockedBcrypt.compare.mockImplementation(
        async (): Promise<boolean> => false,
      );

      await expect(
        changePassword(user, "wrong-password", "new-password"),
      ).rejects.toEqual({
        status: 400,
        error: "Current password is incorrect",
      });

      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        "wrong-password",
        "hashed-password",
      );

      expect(mockedBcrypt.hash).not.toHaveBeenCalled();
      expect(mockedDb.run).not.toHaveBeenCalled();
    });

    it("should change the password successfully", async () => {
      mockedDb.get.mockImplementation(
        (
          _sql: string,
          _params: unknown[],
          callback: (err: null, row: { password_hash: string }) => void,
        ) => {
          callback(null, {
            password_hash: "old-hashed-password",
          });
          return mockedDb;
        },
      );

      mockedBcrypt.compare.mockImplementation(
        async (): Promise<boolean> => true,
      );

      mockedBcrypt.hash.mockImplementation(
        async (): Promise<string> => "new-hashed-password",
      );

      mockedDb.run.mockImplementation(
        (
          _sql: string,
          _params: unknown[],
          callback: (this: { changes: number }, err: null) => void,
        ) => {
          callback.call({ changes: 1 }, null);
          return mockedDb;
        },
      );

      await expect(
        changePassword(user, "current-password", "new-password"),
      ).resolves.toBeUndefined();

      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        "current-password",
        "old-hashed-password",
      );

      expect(mockedBcrypt.hash).toHaveBeenCalledWith("new-password", 10);

      expect(mockedDb.run).toHaveBeenCalledWith(
        "UPDATE users SET password_hash = ? WHERE id = ?",
        ["new-hashed-password", 2],
        expect.any(Function),
      );
    });

    it("should reject when password update changes no rows", async () => {
      mockedDb.get.mockImplementation(
        (
          _sql: string,
          _params: unknown[],
          callback: (err: null, row: { password_hash: string }) => void,
        ) => {
          callback(null, {
            password_hash: "old-hashed-password",
          });
          return mockedDb;
        },
      );

      mockedBcrypt.compare.mockImplementation(
        async (): Promise<boolean> => true,
      );
      mockedBcrypt.hash.mockImplementation(
        async (): Promise<string> => "new-hashed-password",
      );

      mockedDb.run.mockImplementation(
        (
          _sql: string,
          _params: unknown[],
          callback: (this: { changes: number }, err: null) => void,
        ) => {
          callback.call({ changes: 0 }, null);
          return mockedDb;
        },
      );

      await expect(
        changePassword(user, "current-password", "new-password"),
      ).rejects.toEqual({
        status: 404,
        error: "User not found or password not updated.",
      });
    });

    it("should reject when the database update fails", async () => {
      mockedDb.get.mockImplementation(
        (
          _sql: string,
          _params: unknown[],
          callback: (err: null, row: { password_hash: string }) => void,
        ) => {
          callback(null, {
            password_hash: "old-hashed-password",
          });
          return mockedDb;
        },
      );

      mockedBcrypt.compare.mockImplementation(
        async (): Promise<boolean> => true,
      );
      mockedBcrypt.hash.mockImplementation(
        async (): Promise<string> => "new-hashed-password",
      );

      const dbError = new Error("Database update failed");

      mockedDb.run.mockImplementation(
        (
          _sql: string,
          _params: unknown[],
          callback: (this: { changes: number }, err: Error) => void,
        ) => {
          callback.call({ changes: 0 }, dbError);
          return mockedDb;
        },
      );

      await expect(
        changePassword(user, "current-password", "new-password"),
      ).rejects.toEqual({
        status: 500,
        error: "Database update failed",
      });
    });
  });
});
