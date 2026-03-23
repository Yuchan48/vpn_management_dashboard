import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

// Importing pages
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage";
import ChangePassword from "./pages/ChangePassword";

import ProtectedRoute from "./routes/ProtectedRoute";

const App = () => {
  return (
    <div className="App min-h-screen w-full flex items-center justify-center">
      <Router>
        <Routes>
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

          {/* Just for development, remove the token authentication */}
          {/*  <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/change-password" element={<ChangePassword />} /> */}
        </Routes>
      </Router>
    </div>
  );
};

export default App;
