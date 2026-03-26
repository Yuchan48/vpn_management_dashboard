import { useNavigate } from "react-router-dom";

import { logout } from "../../services/authService";

const LogoutButton = () => {
  const navigate = useNavigate();
  const handleLogout = async () => {
    // remove token
    await logout();
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
