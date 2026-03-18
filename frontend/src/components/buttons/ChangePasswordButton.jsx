import { useNavigate } from "react-router-dom";
const ChangePasswordButton = () => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate("/change-password")}
      className="px-3 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-500"
    >
      Change Password
    </button>
  );
};

export default ChangePasswordButton;
