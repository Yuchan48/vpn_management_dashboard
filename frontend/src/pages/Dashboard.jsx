import { useState, eseEffect, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// import UI components
import CurrentUserInfo from "../components/CurrentUserInfo";
import ClientsTable from "../components/ClientsTable";
import UsersTable from "../components/UsersTable";
import ChangePasswordButton from "../components/ChangePasswordButton";
import LogoutButton from "../components/LogoutButton";

// import functions
import { removeToken } from "../utils/auth";
import { isAuthenticated } from "../utils/auth";
import {
  fetchCurrentUser,
  fetchUsers,
  fetchClients,
} from "../services/mockService";

const Dashboard = () => {
  // loading state and error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // fetched data
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [clients, setClients] = useState([]);

  const navigate = useNavigate();

  // logout function
  const handleLogout = () => {
    // remove token
    removeToken();
    // redirect to login page
    navigate("/login");
  };

  useEffect(() => {
    /* if (!isAuthenticated()) {
      navigate("/login");
      return;
    } */

    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const currentUser = await fetchCurrentUser();
    setUser(currentUser);
    if (currentUser.role === "admin") {
      const usersData = await fetchUsers();
      setUsers(usersData);
    }
    const clientsData = await fetchClients(currentUser.role);
    setClients(clientsData);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-10 py-6 space-y-6">
        {/* Header Card */}
        <div className="bg-white rounded-lg shadow-md p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              VPN Management Platform
            </h1>
            {user && (
              <p className="text-sm text-gray-600 mt-1">
                {user.username} • {user.role}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => navigate("/change-password")}
              className="px-3 py-2 text-sm font-semibold text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50"
            >
              Change Password
            </button>

            <button
              onClick={handleLogout}
              className="px-3 py-2 text-sm font-semibold text-white bg-red-500 rounded-md hover:bg-red-400"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Clients Card */}
        <div className="bg-white rounded-lg shadow-md p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Clients</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-gray-500 border-b">
                <tr>
                  <th className="py-2">Name</th>
                  <th className="py-2">IP</th>
                  {user?.role === "admin" && <th className="py-2">Owner</th>}
                  <th className="py-2">Status</th>
                </tr>
              </thead>

              <tbody>
                {clients.map((c) => (
                  <tr key={c.id} className="border-b">
                    <td className="py-2">{c.name}</td>
                    <td className="py-2">{c.ip_address}</td>
                    {user?.role === "admin" && (
                      <td className="py-2">{c.username}</td>
                    )}
                    <td className="py-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          c.status === "online"
                            ? "bg-green-100 text-green-700"
                            : c.status === "offline"
                              ? "bg-gray-200 text-gray-600"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Admin Users Card */}
        {user?.role === "admin" && (
          <div className="bg-white rounded-lg shadow-md p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Users</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-gray-500 border-b">
                  <tr>
                    <th className="py-2">Username</th>
                    <th className="py-2">Role</th>
                    <th className="py-2">Created</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b">
                      <td className="py-2">{u.username}</td>
                      <td className="py-2">{u.role}</td>
                      <td className="py-2">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
