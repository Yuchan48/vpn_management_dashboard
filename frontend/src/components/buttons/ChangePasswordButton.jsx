import { useNavigate } from "react-router-dom";
const ChangePasswordButton = ({ disabled }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate("/change-password")}
      disabled={disabled}
      className={`px-3 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md disabled:bg-gray-500 disabled:cursor-not-allowed ${!disabled ? "hover:bg-indigo-500" : ""}`}
    >
      Change Password
    </button>
  );
};

export default ChangePasswordButton;
