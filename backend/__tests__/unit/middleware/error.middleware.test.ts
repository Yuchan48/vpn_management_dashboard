import type { Request, Response, NextFunction } from "express";

import errorMiddleware from "../../../middleware/error.middleware";

describe("errorMiddleware", () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    req = {} as Request;
    next = jest.fn();

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as unknown as Response;

    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("AppError", () => {
    it("should return the error status and message", () => {
      const error = {
        status: 404,
        error: "Client not found",
      };

      errorMiddleware(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Client not found",
      });
    });

    it("should handle a 400 AppError", () => {
      const error = {
        status: 400,
        error: "Username already taken",
      };

      errorMiddleware(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Username already taken",
      });
    });

    it("should handle a 500 AppError", () => {
      const error = {
        status: 500,
        error: "Database error",
      };

      errorMiddleware(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Database error",
      });
    });
  });

  describe("Error", () => {
    it("should return 500 with the error message", () => {
      const error = new Error("Something went wrong");

      errorMiddleware(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Something went wrong",
      });
    });

    it("should log the Error message", () => {
      const error = new Error("Something went wrong");

      errorMiddleware(error, req, res, next);

      expect(console.error).toHaveBeenCalledWith(
        "Error:",
        "Something went wrong",
      );
    });
  });

  describe("Unknown error", () => {
    it("should return a generic 500 error for an unknown value", () => {
      const error = "unexpected error";

      errorMiddleware(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal Server Error",
      });
    });

    it("should handle null as an unknown error", () => {
      errorMiddleware(null, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal Server Error",
      });
    });

    it("should handle undefined as an unknown error", () => {
      errorMiddleware(undefined, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal Server Error",
      });
    });
  });

  it("should not call next", () => {
    const error = new Error("Something went wrong");

    errorMiddleware(error, req, res, next);

    expect(next).not.toHaveBeenCalled();
  });
});
