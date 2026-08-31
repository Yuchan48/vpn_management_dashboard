import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "../../src/services/apiFetch";

describe("apiFetch", () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    sessionStorage.clear();

    vi.stubGlobal("fetch", vi.fn());
  });

  it("returns JSON data for a successful response", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ id: 1, name: "Test Client" }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );

    const data = await apiFetch<{ id: number; name: string }>("/clients");

    expect(data).toEqual({
      id: 1,
      name: "Test Client",
    });
  });

  it("returns null for a 204 No Content response", async () => {
    const response = new Response(null, {
      status: 204,
    });

    vi.mocked(fetch).mockResolvedValue(response);

    const data = await apiFetch<null>("/clients/1");

    expect(data).toBeNull();
  });

  it("returns text data for a successful text response", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response("WireGuard configuration", {
        status: 200,
        headers: {
          "Content-Type": "text/plain",
        },
      }),
    );

    const data = await apiFetch<string>("/config");

    expect(data).toBe("WireGuard configuration");
  });

  it("returns a Blob for a successful binary response", async () => {
    const response = new Response("wireguard config", {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
      },
    });

    vi.mocked(fetch).mockResolvedValue(response);

    const data = await apiFetch<Blob>("/clients/1/download");

    expect(data).toHaveProperty("type", "application/octet-stream");
    expect(await data.text()).toBe("wireguard config");
  });

  it("returns an error when the response is 204 No Content", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(null, {
        status: 204,
      }),
    );

    const data = await apiFetch<null>("/clients/1");

    expect(data).toBeNull();
  });

  it("redirects to login when the token is invalid", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          error: "Invalid token",
          code: "TOKEN_INVALID",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );

    await expect(apiFetch("/clients")).rejects.toThrow(
      "Authentication required",
    );

    expect(sessionStorage.getItem("auth_error")).toBe(
      "Session expired. Please log in again.",
    );
  });

  it("redirects to login for another AUTH error", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          error: "Token missing",
          code: "TOKEN_MISSING",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );

    await expect(apiFetch("/clients")).rejects.toThrow(
      "Authentication required",
    );
  });

  it("throws an authentication error for a 401 response without an AUTH code", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          error: "Unauthorized",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );

    await expect(apiFetch("/clients")).rejects.toThrow("Unauthorized");
  });

  it("throws the API error message for other HTTP errors", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          error: "Client not found",
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );

    await expect(apiFetch("/clients/999")).rejects.toThrow("Client not found");
  });

  it("throws a default error when the API does not provide an error message", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({}), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );

    await expect(apiFetch("/clients")).rejects.toThrow("API request failed");
  });

  it("sends credentials and JSON headers", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );

    await apiFetch("/clients");

    expect(fetch).toHaveBeenCalledWith(
      "/api/clients",
      expect.objectContaining({
        credentials: "include",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
      }),
    );
  });

  it("passes request options to fetch", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );

    await apiFetch("/clients", {
      method: "POST",
      body: JSON.stringify({
        name: "Test Client",
      }),
    });

    expect(fetch).toHaveBeenCalledWith(
      "/api/clients",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          name: "Test Client",
        }),
        credentials: "include",
      }),
    );
  });
});
