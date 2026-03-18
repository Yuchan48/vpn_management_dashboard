import { removeToken } from "../../utils/auth";
import { useNavigate } from "react-router-dom";

const LogoutButton = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    // remove token
    removeToken();
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
