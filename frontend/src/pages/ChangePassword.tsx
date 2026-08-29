import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

// import UI components
import EyeIcon from "../components/icons/EyeIcon";
import EyeOffIcon from "../components/icons/EyeOffIcon";
import Spinner from "../components/icons/Spinner";

// import functions
import { changePassword } from "../services/userService";
import { logout } from "../services/authService";
import { validatePassword } from "../utils/inputValidators";

const ChangePassword = () => {
  const location = useLocation();

  // set input values
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  // set show/hide password states
  const [showCurrent, setShowCurrent] = useState<boolean>(false);
  const [showNew, setShowNew] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  // set loading state and error message
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const navigate = useNavigate();

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col items-center justify-center bg-gray-700 px-5 sm:px-4">
      <main className="flex flex-1 items-center justify-center">
        <div className="flex flex-col flex-1 items-center justify-center   bg-gray-300 rounded-lg shadow-lg py-10 w-[320px] max-w-[320px]">
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
          <form
            className="space-y-4 text-gray-900 w-[260px]"
            onSubmit={handleSubmit}
          >
            {/* Current Password */}
            <div>
              <label
                className="block text-sm font-medium"
                htmlFor="current-password"
              >
                Current Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="current-password"
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
                  className="absolute inset-y-0 right-2 flex items-center w-6"
                  aria-label={
                    showCurrent
                      ? "Hide current password"
                      : "Show current password"
                  }
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
                className="block text-sm font-medium"
                htmlFor="new-password"
              >
                New Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="new-password"
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
                  className="absolute inset-y-0 right-2 flex items-center w-6"
                  aria-label={
                    showNew ? "Hide new password" : "Show new password"
                  }
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
              <label
                className="block text-sm font-medium"
                htmlFor="confirm-password"
              >
                Confirm New Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirm-password"
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
                  className="absolute inset-y-0 right-2 flex items-center w-6"
                  aria-label={
                    showConfirm
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
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
              aria-label="Change Password"
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
            aria-label="Back to Dashboard"
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
      </main>
      {/* Impressum */}
      <Link
        to="/impressum"
        state={{ from: location.pathname }}
        className="mb-6 text-sm text-gray-100 hover:text-gray-300
        transition-colors duration-200
      "
      >
        Impressum
      </Link>
    </div>
  );
};

export default ChangePassword;
