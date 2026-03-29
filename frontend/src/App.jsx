import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Importing pages
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage";
import ChangePassword from "./pages/ChangePassword";

import ProtectedRoute from "./routes/ProtectedRoute";

const App = () => {
  return (
    <div className="App min-h-screen w-full flex items-center justify-center">
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          style: {
            background: "#333", // dark background
            color: "#fff", // text color
            fontWeight: "500",
            borderRadius: "10px",
            padding: "12px 20px",
            boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
          },
          success: {
            duration: 6000, // longer duration for success
            theme: {
              primary: "green",
              secondary: "white",
            },
          },
          error: {
            duration: 8000, // longer duration for errors
            theme: {
              primary: "red",
              secondary: "white",
            },
          },
        }}
      />
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected route. Only accessible if authenticated. */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
