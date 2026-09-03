import "@testing-library/jest-dom/vitest";

import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";

import Dashboard from "../../src/pages/Dashboard";
import { AuthProvider } from "../../src/context/AuthContext";

import type { User } from "../../src/types/user";
import type { ClientStatus } from "../../src/types/client";

vi.mock("../../src/services/userService", () => ({
  fetchCurrentUser: vi.fn(),
  fetchAllUsers: vi.fn(),
}));

vi.mock("../../src/services/clientService", () => ({
  fetchClients: vi.fn(),
}));

vi.mock("../../src/hooks/useClientsSocket", () => ({
  default: vi.fn(),
}));

vi.mock("../../src/components/CurrentUserInfo", () => ({
  default: () => <div>Current User Info</div>,
}));

vi.mock("../../src/components/tables/ClientsTable", () => ({
  default: () => <div>Clients Table</div>,
}));

vi.mock("../../src/components/tables/UsersTable", () => ({
  default: () => <div>Users Table</div>,
}));

vi.mock("../../src/components/buttons/ChangePasswordButton", () => ({
  default: () => <button>Change Password</button>,
}));

vi.mock("../../src/components/buttons/LogoutButton", () => ({
  default: () => <button>Logout</button>,
}));

vi.mock("../../src/components/LoadingScreen", () => ({
  default: () => <div>Loading...</div>,
}));

import {
  fetchCurrentUser,
  fetchAllUsers,
} from "../../src/services/userService";
import { fetchClients } from "../../src/services/clientService";

const mockedFetchCurrentUser = vi.mocked(fetchCurrentUser);
const mockedFetchAllUsers = vi.mocked(fetchAllUsers);
const mockedFetchClients = vi.mocked(fetchClients);

const regularUser: User = {
  id: 1,
  username: "testuser",
  role: "user",
  is_demo: 0,
  created_at: "2026-08-31",
};

const adminUser: User = {
  id: 2,
  username: "admin",
  role: "admin",
  is_demo: 0,
  created_at: "2026-07-31",
};

const clients: ClientStatus[] = [
  {
    clientId: 1,
    name: "test-client",
    status: "Online",
    userId: 1,
    username: "testuser",
  },
];

describe("Dashboard - Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should load the dashboard for a regular user", async () => {
    mockedFetchCurrentUser.mockResolvedValueOnce(regularUser);
    mockedFetchClients.mockResolvedValueOnce(clients);

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <AuthProvider>
          <Dashboard />
        </AuthProvider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Clients Table")).toBeInTheDocument();
    });

    expect(mockedFetchClients).toHaveBeenCalledTimes(1);
    expect(mockedFetchAllUsers).not.toHaveBeenCalled();

    expect(screen.queryByText("Users Table")).not.toBeInTheDocument();
  });

  it("should load users and clients for an admin", async () => {
    mockedFetchCurrentUser.mockResolvedValueOnce(adminUser);
    mockedFetchClients.mockResolvedValueOnce(clients);
    mockedFetchAllUsers.mockResolvedValueOnce([adminUser, regularUser]);

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <AuthProvider>
          <Dashboard />
        </AuthProvider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Users Table")).toBeInTheDocument();
    });

    expect(mockedFetchClients).toHaveBeenCalledTimes(1);
    expect(mockedFetchAllUsers).toHaveBeenCalledTimes(1);

    expect(screen.getByText("Clients Table")).toBeInTheDocument();
    expect(screen.getByText("Users Table")).toBeInTheDocument();
  });
});
