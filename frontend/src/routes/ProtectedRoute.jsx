import { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { fetchCurrentUser } from "../services/userService";

function ProtectedRoute({ children }) {
  const location = useLocation();

  const [authorized, setAuthorized] = useState(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        await fetchCurrentUser();
        setAuthorized(true);
      } catch {
        setAuthorized(false);
      }
    }
    checkAuth();
  }, []);
  if (authorized === null) {
    return null; // or a loading spinner
  }
  if (!authorized) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}

export default ProtectedRoute;
