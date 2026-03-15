import { useState } from "react";
import EyeIcon from "../components/icons/EyeIcon";
import EyeOffIcon from "../components/icons/EyeOffIcon";

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="bg-gray-300 px-10 py-15 rounded-lg shadow-lg">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="text-center text-2xl/9 font-bold tracking-tight text-gray-800">
            Change Your Password
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form action="#" method="POST" className="space-y-3 text-gray-900">
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
                  onChange={(e) => setCurrentPassword(e.target.value)}
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
                  onChange={(e) => setNewPassword(e.target.value)}
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
                  onChange={(e) => setConfirmPassword(e.target.value)}
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

            <div className="mt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center rounded-md bg-indigo-700 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500
                disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400
                "
              >
                Change Password
              </button>
            </div>
          </form>
          <a
            href="/login"
            className={`block mt-4 text-center text-base/6 font-semibold ${isLoading ? "text-gray-400 pointer-events-none cursor-not-allowed" : "text-indigo-700 hover:text-indigo-500"}`}
          >
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
