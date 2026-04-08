import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// import UI components
import EyeIcon from "../components/icons/EyeIcon";
import EyeOffIcon from "../components/icons/EyeOffIcon";
import Spinner from "../components/icons/Spinner";

// import functions
import { login } from "../services/authService";

const LoginPage = () => {
  // input values
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // show/hide password
  const [show, setShow] = useState(false);

  // loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // display message passed via navigate() from other pages
    if (location.state?.message) {
      setError(location.state.message);
    } else {
      const queryParams = new URLSearchParams(location.search);
      const message = queryParams.get("message");
      if (message) {
        setError(message);
      }
    }
  }, [location]);

  const handleSubmit = async (event) => {
    // prevents the page reloading on form submission
    event.preventDefault();
    setError("");

    // validate username and password
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }

    try {
      setIsLoading(true);

      // Call the login API
      await login(username, password);

      // Navigate to the dashboard
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setUsername("demo_user");
    setPassword("demo_password");
    setError("");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-700 px-5 sm:px-4">
      <div className="w-full max-w-sm bg-gray-300 rounded-lg shadow-lg px-6 py-10 sm:px-10 sm:py-14">
        {/* Title + Error */}
        <div className="w-full text-center mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-gray-800">
            Sign in to your account
          </h2>

          <div className="h-5 mt-2 text-sm text-red-600 bg-gray-300">
            {error || "\u00A0"}
          </div>
        </div>

        {/* Form */}
        <form className="space-y-4 text-gray-900" onSubmit={handleSubmit}>
          {/* Username */}
          <div>
            <label className="block text-sm font-medium">Username</label>
            <input
              type="text"
              required
              disabled={isLoading}
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError("");
              }}
              autoComplete="username"
              className="mt-1 block w-full rounded-md border border-gray-500 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium">Password</label>
            <div className="mt-1 relative">
              <input
                type={show ? "text" : "password"}
                required
                disabled={isLoading}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                autoComplete="current-password"
                className="block w-full rounded-md border border-gray-500 bg-white px-3 py-2 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <button
                type="button"
                className="absolute inset-y-0 right-2 flex items-center"
                onClick={() => setShow(!show)}
              >
                {show ? (
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
            className="w-full flex items-center justify-center rounded-md bg-indigo-600 mt-6 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Spinner className="h-5 w-5 mr-2 text-white" />
                Processing...
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        {/* ⭐ Demo Login Button */}
        <button
          onClick={handleDemoLogin}
          disabled={isLoading}
          className="mt-4 w-full flex items-center justify-center rounded-md border border-indigo-700 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 disabled:bg-gray-200 disabled:cursor-not-allowed"
        >
          Use Demo Account
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
