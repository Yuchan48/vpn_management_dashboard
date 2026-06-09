import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useClientsSocket from "../hooks/useClientsSocket";
import { useAuth } from "../context/AuthContext";

// import UI components
// tables and user info
import CurrentUserInfo from "../components/CurrentUserInfo";
import ClientsTable from "../components/tables/ClientsTable";
import UsersTable from "../components/tables/UsersTable";
// buttons
import ChangePasswordButton from "../components/buttons/ChangePasswordButton";
import LogoutButton from "../components/buttons/LogoutButton";
// state screens
import LoadingScreen from "../components/LoadingScreen";

// import functions
import { fetchAllUsers } from "../services/userService";
import { fetchClients } from "../services/clientService";

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  // loading state and error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // fetched data
  const [users, setUsers] = useState([]);
  const [clients, setClients] = useState([]);

  useClientsSocket(setClients);

  useEffect(() => {
    const loadData = async () => {
      setError("");
      setLoading(true);
      try {
        if (user.role === "admin") {
          const usersData = await fetchAllUsers();
          setUsers(usersData);
        }
        const clientsData = await fetchClients();
        setClients(clientsData);
      } catch {
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  if (loading || authLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen w-full bg-gray-100  flex flex-col">
      {/* Main content */}
      <div className="flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-10 py-6 space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-lg shadow-md p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                VPN Management Platform
              </h1>
              {user && <CurrentUserInfo user={user} />}
            </div>
            {/* Navigation Buttons */}
            <div className="flex gap-2">
              <Link
                to="/setup-guide"
                className="text-center px-3 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-500 disabled:bg-gray-500 disabled:cursor-not-allowed"
              >
                Setup Guide
              </Link>
              <ChangePasswordButton disabled={user.is_demo === 1} />
              <LogoutButton />
            </div>
          </div>

          {/* Clients Card */}
          {user.is_demo === 1 && (
            <div className="mb-4 px-6 py-3 bg-yellow-100 text-yellow-800 rounded text-sm">
              ⚠️ Demo clients are temporary and auto-removed after 30 minutes.
              Re-downloading the config invalidates previous files. If the
              downloaded filename adds "(1)" or similar, rename it to only
              letters, numbers, or "-" (max 15 chars) to avoid errors.
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <ClientsTable clients={clients} user={user} setClients={setClients} />

          {/* Admin Users Card */}
          {user?.role === "admin" && (
            <UsersTable
              users={users}
              user={user}
              setUsers={setUsers}
              onUserDeleted={fetchClients}
            />
          )}
        </div>
      </div>
      {/* Impressum */}
      <a
        href="/impressum"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full text-center text-sm mb-4 text-gray-500 hover:underline"
      >
        Impressum
      </a>
    </div>
  );
};

export default Dashboard;
