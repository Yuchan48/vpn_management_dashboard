import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// import UI components
import Spinner from "../components/icons/Spinner";

function ProtectedRoute({ children }) {
  const location = useLocation();

  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading... <Spinner className="ml-2" />
      </div>
    ); // or a loading spinner
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

export default ProtectedRoute;
