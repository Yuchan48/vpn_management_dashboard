import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

// Importing pages
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage";
import ChangePassword from "./pages/ChangePassword";

import ProtectedRoute from "./routes/ProtectedRoute";

const App = () => {
  return (
    <Router>
      <div className="App h-screen flex items-center justify-center bg-gray-700">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/change-password" element={<ChangePassword />} />

          {/* Protected route. Only accessible if authenticated. */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
