import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import EyeIcon from "../components/icons/EyeIcon";
import EyeOffIcon from "../components/icons/EyeOffIcon";

import { validateUsername, validatePassword } from "../utils/inputValidators";
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
    }
  }, [location.state]);

  const handleSubmit = async (event) => {
    // prevents the page reloading on form submission
    event.preventDefault();
    setError("");

    // validate username and password
    if (!username || !password) {
      setError("Please enter both username and password.");
      return;
    }

    const usernameError = validateUsername(username);
    const passwordError = validatePassword(password);

    if (usernameError || passwordError) {
      setError(usernameError || passwordError);
      return;
    }

    try {
      setIsLoading(true);

      // Call the login API
      const data = await login(username, password);

      // Navigate to the dashboard and pass the token in state
      navigate("/dashboard", { state: { token: data.token } });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="bg-gray-300 px-10 py-20 rounded-lg shadow-lg">
        <div className="mx-auto w-[280px] text-center">
          <h2 className="text-center text-2xl/9 font-bold tracking-tight text-gray-800">
            Sign in to your account
          </h2>
          {/* Error message */}
          <div className="w-full text-center text-sm text-red-600 overflow-hidden">
            {error || "\u00A0"}
          </div>
        </div>

        <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-sm">
          <form
            action="#"
            method="POST"
            className="space-y-3 text-gray-900"
            onSubmit={handleSubmit}
          >
            {/* Username input */}
            <div>
              <label htmlFor="email" className="block text-sm/6 font-medium ">
                Username
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  disabled={isLoading}
                  value={username}
                  onChange={(event) => {
                    setUsername(event.target.value);
                    setError("");
                  }}
                  autoComplete="username"
                  className="block w-full rounded-md border-1 border-gray-500 bg-white/5 px-3 py-1.5 text-base outline-1 -outline-offset-1 outline-white/10  focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                />
              </div>
            </div>

            {/* Password input */}
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm/6 font-medium "
                >
                  Password
                </label>
              </div>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={show ? "text" : "password"}
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                  className="block w-full rounded-md border-1 border-gray-500 bg-white/5 px-3 py-1.5 text-base outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                  }}
                />
                <button
                  type="button"
                  className="icon_button absolute right-2 top-1/2 transform -translate-y-1/2"
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
            {/* Submit Button */}
            <div className="mt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center rounded-md bg-indigo-700 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500
                disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400
                "
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
