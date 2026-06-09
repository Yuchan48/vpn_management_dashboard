import { useNavigate } from "react-router-dom";

import { logout } from "../../services/authService";

import { useAuth } from "../../context/AuthContext";

const LogoutButton = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const handleLogout = async () => {
    // remove token
    await logout();
    // clear user context
    setUser(null);
    // redirect to login page
    navigate("/login");
  };
  return (
    <button
      onClick={handleLogout}
      className="px-3 py-2 text-sm font-semibold text-indigo-700 border border-indigo-700 rounded-md hover:bg-indigo-100"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
