import { extractJwtFromCookie } from "../../../utils/auth";

describe("extractJwtFromCookie", () => {
  it("returns the JWT token when the token cookie exists", () => {
    const result = extractJwtFromCookie("token=abc123");

    expect(result).toBe("abc123");
  });

  it("returns null when the cookie header is undefined", () => {
    const result = extractJwtFromCookie(undefined);

    expect(result).toBeNull();
  });

  it("returns null when the cookie header is empty", () => {
    const result = extractJwtFromCookie("");

    expect(result).toBeNull();
  });

  it("returns null when the token cookie does not exist", () => {
    const result = extractJwtFromCookie("session=abc123; user=test");

    expect(result).toBeNull();
  });

  it("extracts the token when multiple cookies are present", () => {
    const result = extractJwtFromCookie(
      "session=abc123; token=my-jwt-token; user=test",
    );

    expect(result).toBe("my-jwt-token");
  });

  it("handles whitespace around cookies", () => {
    const result = extractJwtFromCookie(
      "session=abc123;  token=my-jwt-token  ; user=test",
    );

    expect(result).toBe("my-jwt-token");
  });

  it("decodes a URL-encoded token", () => {
    const result = extractJwtFromCookie("token=abc%2E123%3D");

    expect(result).toBe("abc.123=");
  });
  it("ignores a malformed cookie without a value", () => {
    const result = extractJwtFromCookie("session; token=abc123");

    expect(result).toBe("abc123");
  });
});
