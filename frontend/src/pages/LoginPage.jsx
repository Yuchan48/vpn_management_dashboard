import React, { useState } from "react";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setIsLoading(true);

      // Replace this with the real login API call.
      await new Promise((resolve) => setTimeout(resolve, 1200));
      console.log("Login submitted:", { username, password });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1>Login Page</h1>
      <p>Please enter your credentials to log in.</p>

      <form onSubmit={handleSubmit} aria-busy={isLoading}>
        <div>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
