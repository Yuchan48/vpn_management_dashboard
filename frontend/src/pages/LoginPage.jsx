import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// import assets
import loginBg from "../assets/login_bg.jpg";

// import UI components
import EyeIcon from "../components/icons/EyeIcon";
import EyeOffIcon from "../components/icons/EyeOffIcon";
import Spinner from "../components/icons/Spinner";
import GitHubIcon from "../components/icons/GitHubIcon";

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
    /*  if (location.state?.message) {
      setError(location.state.message);
    } else {
      const queryParams = new URLSearchParams(location.search);
      const message = queryParams.get("message");
      if (message) {
        setError(message);
      }
    }

    }, [location]);
    */
    const message =
      location.state?.message || sessionStorage.getItem("auth_error");

    if (message) {
      setError(message);
      sessionStorage.removeItem("auth_error");
    }
  }, [location.state]);

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
    <div className="min-h-screen w-full bg-gray-900 flex flex-col">
      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Hero Section */}
        <div className="relative lg:w-1/2 h-104 lg:h-screen lg:flex-row">
          <img
            src={loginBg}
            alt="WireGuard VPN"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-black/50" />

          <div className="relative z-10 flex h-full flex-col justify-center px-8 lg:px-16 text-white">
            <h1 className="text-3xl lg:text-5xl font-bold">
              WireGuard VPN
              <br />
              Management Portal
            </h1>

            <p className="mt-4 text-base lg:text-lg text-gray-200">
              Manage VPN users securely from a simple web dashboard.
              <br />
              Try the live demo using the Demo Account.
            </p>

            <a
              href="https://github.com/Yuchan48/vpn_management_dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex w-fit items-center text-sm font-medium text-indigo-300 hover:text-indigo-200"
            >
              <GitHubIcon className="h-5 w-5 mr-2" />
              <span> View Source on GitHub</span>
            </a>
          </div>
        </div>

        {/* Login Container */}
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="w-[340px] rounded-xl bg-gray-100 shadow-xl border border-gray-200 p-8 mt-6">
            {/* Title + Error */}
            <div className="w-full text-center mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-gray-800">
                Sign in to your account
              </h2>

              <div className="h-5 mt-2 text-sm text-red-600">
                {error || "\u00A0"}
              </div>
            </div>

            {/* Form */}
            <form
              className="space-y-4 text-gray-900 w-[280px] items-center mx-auto"
              onSubmit={handleSubmit}
            >
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

            {/* Demo Login Button */}
            <button
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="w-[280px] mt-4  flex items-center justify-center rounded-md border border-indigo-700 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 disabled:bg-gray-200 disabled:cursor-not-allowed"
            >
              Use Demo Account
            </button>
          </div>
        </div>
      </div>

      {/* Impressum */}
      <div className="pb-6 text-center">
        <a
          href="/impressum"
          target="_blank"
          rel="noopener noreferrer"
          className="mb-6 text-sm text-gray-400 hover:text-gray-200
        transition-colors duration-200
      "
        >
          Impressum
        </a>
      </div>
    </div>
  );
};

export default LoginPage;
