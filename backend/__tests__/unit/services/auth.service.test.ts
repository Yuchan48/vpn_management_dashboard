import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { loginUser } from "../../../services/auth.service";
import { db } from "../../../database/db";

import type { UserWithPassword } from "../../../types/user";

jest.mock("bcrypt");
jest.mock("../../../database/db");

jest.mock("jsonwebtoken", () => ({
  __esModule: true,
  default: {
    sign: jest.fn(() => "mock-jwt-token"),
  },
}));

const mockedBcrypt = jest.mocked(bcrypt);
const mockedJwtSign = jest.mocked(jwt.sign);
const mockedDb = jest.mocked(db);

describe("loginUser", () => {
  const mockUser: UserWithPassword = {
    id: 2,
    username: "testuser",
    password_hash: "hashed-password",
    role: "user",
    is_demo: 0,
    created_at: new Date("2026-08-30T12:00:00Z"),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    process.env.JWT_SECRET = "test-jwt-secret";
    process.env.JWT_EXPIRES_IN = "1h";

    mockedBcrypt.compare.mockImplementation(async (): Promise<boolean> => true);

    mockedBcrypt.hash.mockImplementation(
      async (): Promise<string> => "hashed-password",
    );
  });

  describe("successful login", () => {
    it("should return a JWT token and user without password_hash", async () => {
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

      mockedBcrypt.compare.mockImplementation(
        async (): Promise<boolean> => true,
      );

      const result = await loginUser("testuser", "password123");

      expect(result).toEqual({
        token: "mock-jwt-token",
        user: {
          id: 2,
          username: "testuser",
          role: "user",
          is_demo: 0,
          created_at: new Date("2026-08-30T12:00:00Z"),
        },
      });

      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        "password123",
        "hashed-password",
      );

      expect(mockedJwtSign).toHaveBeenCalledWith(
        {
          sub: 2,
          role: "user",
        },
        "test-jwt-secret",
        {
          expiresIn: "1h",
          issuer: "personal-vpn-backend",
        },
      );
    });
  });

  describe("validation", () => {
    it("should reject when username is missing", async () => {
      await expect(loginUser("", "password123")).rejects.toEqual({
        error: "Username and password are required",
        status: 400,
      });

      expect(mockedDb.get).not.toHaveBeenCalled();
    });

    it("should reject when password is missing", async () => {
      await expect(loginUser("testuser", "")).rejects.toEqual({
        error: "Username and password are required",
        status: 400,
      });

      expect(mockedDb.get).not.toHaveBeenCalled();
    });
  });

  describe("authentication failure", () => {
    it("should reject when the user does not exist", async () => {
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

      mockedBcrypt.compare.mockImplementation(
        async (): Promise<boolean> => true,
      );

      await expect(loginUser("nonexistent", "password123")).rejects.toEqual({
        error: "Invalid login information",
        status: 401,
      });

      expect(mockedBcrypt.compare).toHaveBeenCalled();
    });

    it("should reject when the password is incorrect", async () => {
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

      mockedBcrypt.compare.mockImplementation(
        async (): Promise<boolean> => false,
      );

      await expect(loginUser("testuser", "wrong-password")).rejects.toEqual({
        error: "Invalid login information",
        status: 401,
      });

      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        "wrong-password",
        "hashed-password",
      );

      expect(mockedJwtSign).not.toHaveBeenCalled();
    });
  });

  describe("database errors", () => {
    it("should reject when the database query fails", async () => {
      const databaseError = new Error("Database connection failed");

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

      await expect(loginUser("testuser", "password123")).rejects.toBe(
        databaseError,
      );

      expect(mockedBcrypt.compare).not.toHaveBeenCalled();
    });
  });

  describe("JWT configuration", () => {
    it("should reject when JWT_SECRET is missing", async () => {
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

      mockedBcrypt.compare.mockImplementation(
        async (): Promise<boolean> => true,
      );

      delete process.env.JWT_SECRET;

      await expect(loginUser("testuser", "password123")).rejects.toThrow(
        "JWT_SECRET is not defined in environment variables",
      );

      expect(mockedJwtSign).not.toHaveBeenCalled();
    });

    it("should use the default JWT expiration when JWT_EXPIRES_IN is not defined", async () => {
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

      mockedBcrypt.compare.mockImplementation(
        async (): Promise<boolean> => true,
      );

      delete process.env.JWT_EXPIRES_IN;

      await loginUser("testuser", "password123");

      expect(mockedJwtSign).toHaveBeenCalledWith(
        {
          sub: 2,
          role: "user",
        },
        "test-jwt-secret",
        {
          expiresIn: "1h",
          issuer: "personal-vpn-backend",
        },
      );
    });
  });

  describe("demo users", () => {
    it("should return demo user information without password_hash", async () => {
      const demoUser: UserWithPassword = {
        ...mockUser,
        username: "demo_user",
        is_demo: 1,
      };

      mockedDb.get.mockImplementation(
        (
          _sql: string,
          _params: unknown[],
          callback: (err: Error | null, row?: unknown) => void,
        ) => {
          callback(null, demoUser);
          return mockedDb;
        },
      );

      mockedBcrypt.compare.mockImplementation(
        async (): Promise<boolean> => true,
      );

      const result = await loginUser("demo_user", "password123");

      expect(result.user).toEqual({
        id: 2,
        username: "demo_user",
        role: "user",
        is_demo: 1,
        created_at: new Date("2026-08-30T12:00:00Z"),
      });

      expect(result.user).not.toHaveProperty("password_hash");
    });
  });
});
