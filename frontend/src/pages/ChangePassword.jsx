import { useState } from "react";
import { useNavigate } from "react-router-dom";

// import UI components
import EyeIcon from "../components/icons/EyeIcon";
import EyeOffIcon from "../components/icons/EyeOffIcon";
import Spinner from "../components/icons/Spinner";

// import functions
import { changePassword } from "../services/userService";
import { logout } from "../services/authService";
import { validatePassword } from "../utils/inputValidators";

const ChangePassword = () => {
  // set input values
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // set show/hide password states
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // set loading state and error message
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    // verify the inputs before calling the API
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }
    if (currentPassword === newPassword) {
      setError("New password must be different from current password.");
      return;
    }

    const validationError = validatePassword(newPassword);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsLoading(true);

      // Call the change password API
      await changePassword(currentPassword, newPassword);

      // On success, log out the user and redirect to login page with a message
      await logout();
      navigate("/login", {
        state: {
          message: "Password changed. Please log in with your new password.",
        },
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-700 px-5 sm:px-4">
      <div className="w-full max-w-sm bg-gray-300 rounded-lg shadow-lg px-6 py-10 sm:px-10 sm:py-14">
        {/* Title + Error */}
        <div className="w-full text-center mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-gray-800">
            Change Your Password
          </h2>

          <div className="h-5 mt-2 text-sm text-red-600">
            {error || "\u00A0"}
          </div>
        </div>

        {/* Form */}
        <form className="space-y-4 text-gray-900" onSubmit={handleSubmit}>
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium">
              Current Password
            </label>
            <div className="mt-1 relative">
              <input
                type={showCurrent ? "text" : "password"}
                required
                disabled={isLoading}
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  setError("");
                }}
                autoComplete="current-password"
                className="block w-full rounded-md border border-gray-500 bg-white px-3 py-2 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-2 flex items-center"
                onClick={() => setShowCurrent(!showCurrent)}
              >
                {showCurrent ? (
                  <EyeOffIcon className="h-5 w-5 text-gray-500" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-500" />
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium">New Password</label>
            <div className="mt-1 relative">
              <input
                type={showNew ? "text" : "password"}
                required
                disabled={isLoading}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setError("");
                }}
                autoComplete="new-password"
                className="block w-full rounded-md border border-gray-500 bg-white px-3 py-2 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-2 flex items-center"
                onClick={() => setShowNew(!showNew)}
              >
                {showNew ? (
                  <EyeOffIcon className="h-5 w-5 text-gray-500" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-500" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium">
              Confirm New Password
            </label>
            <div className="mt-1 relative">
              <input
                type={showConfirm ? "text" : "password"}
                required
                disabled={isLoading}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError("");
                }}
                autoComplete="new-password"
                className="block w-full rounded-md border border-gray-500 bg-white px-3 py-2 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-2 flex items-center"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? (
                  <EyeOffIcon className="h-5 w-5 text-gray-500" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-500" />
                )}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Spinner className="h-5 w-5 mr-2 text-white" />
                Processing...
              </>
            ) : (
              "Change Password"
            )}
          </button>
        </form>

        {/* Back to Dashboard */}
        <button
          type="button"
          disabled={isLoading}
          onClick={() => navigate("/dashboard")}
          className={`mt-6 w-full text-center text-sm font-semibold ${
            isLoading
              ? "text-gray-400 cursor-not-allowed"
              : "text-indigo-700 hover:text-indigo-500"
          }`}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default ChangePassword;
