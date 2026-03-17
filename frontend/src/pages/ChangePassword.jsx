import { useState } from "react";
import { useNavigate } from "react-router-dom";

// import UI components
import EyeIcon from "../components/icons/EyeIcon";
import EyeOffIcon from "../components/icons/EyeOffIcon";

// import functions
import { changePassword } from "../services/userService";
import { removeToken } from "../utils/auth";

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

    try {
      setIsLoading(true);

      // Call the change password API
      await changePassword(currentPassword, newPassword);

      // On success, log out the user and redirect to login page with a message
      removeToken();
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
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="bg-gray-300 px-10 py-15 rounded-lg shadow-lg">
        <div className="mx-auto w-[280px] text-center">
          <h2 className="text-center text-2xl/9 font-bold tracking-tight text-gray-800">
            Change Your Password
          </h2>
          {/* Error message */}
          <div className="w-full text-center text-sm text-red-600 overflow-hidden">
            {error || "\u00A0"}
          </div>
        </div>

        <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-sm">
          <form action="#" method="POST" className="space-y-3 text-gray-900">
            {/* Current Password */}
            <div>
              <label
                htmlFor="current-password"
                className="block text-sm/6 font-medium "
              >
                Current Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="current-password"
                  name="current-password"
                  type={showCurrent ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  disabled={isLoading}
                  className="block w-full border-1 border-gray-500 rounded-md bg-white/5 px-3 py-1.5 text-base outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                  value={currentPassword}
                  onChange={(event) => {
                    setCurrentPassword(event.target.value);
                    setError("");
                  }}
                />
                <button
                  type="button"
                  className="icon_button absolute right-2 top-1/2 transform -translate-y-1/2"
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
              <label
                htmlFor="new-password"
                className="block text-sm/6 font-medium"
              >
                New Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="new-password"
                  name="new-password"
                  type={showNew ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  disabled={isLoading}
                  className="block w-full border-1 border-gray-500 rounded-md bg-white/5 px-3 py-1.5 text-base outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                  value={newPassword}
                  onChange={(event) => {
                    setNewPassword(event.target.value);
                    setError("");
                  }}
                />
                <button
                  type="button"
                  className="icon_button absolute right-2 top-1/2 transform -translate-y-1/2"
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
            {/* Confirm New Password */}
            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm/6 font-medium"
              >
                Confirm New Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type={showConfirm ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  disabled={isLoading}
                  className="block w-full border-1 border-gray-500 rounded-md bg-white/5 px-3 py-1.5 text-base outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    setError("");
                  }}
                />
                <button
                  type="button"
                  className="icon_button absolute right-2 top-1/2 transform -translate-y-1/2"
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
            {/* Submit Button */}
            <div className="mt-6">
              <button
                type="submit"
                disabled={isLoading}
                onClick={handleSubmit}
                className="flex w-full justify-center rounded-md bg-indigo-700 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500
                disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400
                "
              >
                Change Password
              </button>
            </div>
          </form>
          {/* Link to Dashboard */}
          <a
            href="/dashboard"
            className={`block mt-4 text-center text-base/6 font-semibold ${isLoading ? "text-gray-400 pointer-events-none cursor-not-allowed" : "text-indigo-700 hover:text-indigo-500"}`}
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
