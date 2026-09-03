import "@testing-library/jest-dom/vitest";

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";

import LoginPage from "../../src/pages/LoginPage";
import { AuthProvider } from "../../src/context/AuthContext";

import type { User } from "../../src/types/user";

vi.mock("../../src/services/authService", () => ({
  login: vi.fn(),
}));

vi.mock("../../src/services/userService", () => ({
  fetchCurrentUser: vi.fn(),
}));

import { login } from "../../src/services/authService";
import { fetchCurrentUser } from "../../src/services/userService";

const mockedLogin = vi.mocked(login);
const mockedFetchCurrentUser = vi.mocked(fetchCurrentUser);

const testUser: User = {
  id: 1,
  username: "testuser",
  role: "user",
  is_demo: 0,
  created_at: "2026-08-31",
};

function renderLoginPage() {
  return render(
    <MemoryRouter initialEntries={["/login"]}>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("LoginPage - Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should log in successfully and navigate to the dashboard", async () => {
    // AuthProvider's initial request
    mockedFetchCurrentUser
      .mockRejectedValueOnce(new Error("Not authenticated"))
      // Request made after successful login
      .mockResolvedValueOnce(testUser);

    mockedLogin.mockResolvedValueOnce({
      message: "Login successful",
    });

    renderLoginPage();

    await waitFor(() => {
      expect(screen.getByLabelText("Username")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "testuser" },
    });

    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(mockedLogin).toHaveBeenCalledWith("testuser", "password123");
    });

    expect(mockedFetchCurrentUser).toHaveBeenCalledTimes(2);
  });

  it("should display an error when login fails", async () => {
    // AuthProvider's initial request
    mockedFetchCurrentUser.mockRejectedValueOnce(
      new Error("Not authenticated"),
    );

    mockedLogin.mockRejectedValueOnce(
      new Error("Invalid username or password"),
    );

    renderLoginPage();

    await waitFor(() => {
      expect(screen.getByLabelText("Username")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "testuser" },
    });

    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "wrongpassword" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(
      await screen.findByText("Invalid username or password"),
    ).toBeInTheDocument();
  });
});
