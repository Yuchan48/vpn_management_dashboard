import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useClientsSocket from "../hooks/useClientsSocket";

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
import { fetchAllUsers, fetchCurrentUser } from "../services/userService";
import { fetchClients } from "../services/clientService";

const Dashboard = () => {
  const navigate = useNavigate();
  // loading state and error
  const [loading, setLoading] = useState(true);

  // fetched data
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [clients, setClients] = useState([]);

  useClientsSocket(setClients);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const currentUser = await fetchCurrentUser();
        setUser(currentUser);
        if (currentUser.role === "admin") {
          const usersData = await fetchAllUsers();
          setUsers(usersData);
        }
        const clientsData = await fetchClients();
        setClients(clientsData);
      } catch {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  if (loading) {
    return <LoadingScreen />;
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
            {user && <CurrentUserInfo user={user} />}
          </div>

          <div className="flex gap-2">
            <ChangePasswordButton disabled={user.is_demo === 1} />

            <LogoutButton />
          </div>
        </div>

        {/* Clients Card */}
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
  );
};

export default Dashboard;
