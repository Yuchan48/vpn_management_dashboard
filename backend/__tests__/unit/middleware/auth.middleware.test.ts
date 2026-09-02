import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { authenticateToken } from "../../../middleware/auth.middleware";

jest.mock("jsonwebtoken", () => ({
  __esModule: true,
  default: {
    verify: jest.fn(),
  },
}));

const mockedJwt = jwt as jest.Mocked<typeof jwt>;

describe("authenticateToken", () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      cookies: {},
    } as Request;

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as unknown as Response;

    next = jest.fn();

    process.env.JWT_SECRET = "test-secret";
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
  });

  describe("missing token", () => {
    it("should return 401 when token is missing", () => {
      req.cookies = {};

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Token missing",
        code: "TOKEN_MISSING",
      });
      expect(next).not.toHaveBeenCalled();
      expect(mockedJwt.verify).not.toHaveBeenCalled();
    });
  });

  describe("JWT secret", () => {
    it("should return 500 when JWT_SECRET is not defined", () => {
      delete process.env.JWT_SECRET;

      req.cookies = {
        token: "valid-token",
      };

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal server error",
      });
      expect(next).not.toHaveBeenCalled();
      expect(mockedJwt.verify).not.toHaveBeenCalled();
    });
  });

  describe("invalid token", () => {
    it("should return 401 when JWT verification fails", () => {
      req.cookies = {
        token: "invalid-token",
      };

      mockedJwt.verify.mockImplementation(
        (_token, _secretOrPublicKey, _options, callback) => {
          if (typeof callback === "function") {
            callback(
              {
                name: "JsonWebTokenError",
                message: "Invalid token",
              } as jwt.JsonWebTokenError,
              undefined,
            );
          }

          return undefined as never;
        },
      );

      authenticateToken(req, res, next);

      expect(mockedJwt.verify).toHaveBeenCalledWith(
        "invalid-token",
        "test-secret",
        {
          issuer: "personal-vpn-backend",
        },
        expect.any(Function),
      );

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid token",
        code: "TOKEN_INVALID",
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("valid token", () => {
    it("should attach the user to the request and call next", () => {
      req.cookies = {
        token: "valid-token",
      };

      mockedJwt.verify.mockImplementation(
        (_token, _secretOrPublicKey, _options, callback) => {
          if (typeof callback === "function") {
            callback(null, {
              sub: "5",
              role: "user",
              is_demo: 0,
            });
          }

          return undefined as never;
        },
      );

      authenticateToken(req, res, next);

      expect(mockedJwt.verify).toHaveBeenCalledWith(
        "valid-token",
        "test-secret",
        {
          issuer: "personal-vpn-backend",
        },
        expect.any(Function),
      );

      expect(req.user).toEqual({
        id: 5,
        role: "user",
        is_demo: 0,
      });

      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it("should convert the JWT subject to a number", () => {
      req.cookies = {
        token: "valid-token",
      };

      mockedJwt.verify.mockImplementation(
        (_token, _secretOrPublicKey, _options, callback) => {
          if (typeof callback === "function") {
            callback(null, {
              sub: "123",
              role: "admin",
              is_demo: 0,
            });
          }

          return undefined as never;
        },
      );

      authenticateToken(req, res, next);

      expect(req.user).toEqual({
        id: 123,
        role: "admin",
        is_demo: 0,
      });

      expect(next).toHaveBeenCalledTimes(1);
    });

    it("should preserve the is_demo value from the token", () => {
      req.cookies = {
        token: "valid-token",
      };

      mockedJwt.verify.mockImplementation(
        (_token, _secretOrPublicKey, _options, callback) => {
          if (typeof callback === "function") {
            callback(null, {
              sub: "7",
              role: "user",
              is_demo: 1,
            });
          }

          return undefined as never;
        },
      );

      authenticateToken(req, res, next);

      expect(req.user).toEqual({
        id: 7,
        role: "user",
        is_demo: 1,
      });

      expect(next).toHaveBeenCalledTimes(1);
    });
  });
});
