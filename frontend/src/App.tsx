import { lazy, Suspense } from "react";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Importing pages
import LoginPage from "./pages/LoginPage";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const ChangePassword = lazy(() => import("./pages/ChangePassword"));
const Impressum = lazy(() => import("./pages/Impressum"));
const SetupGuide = lazy(() => import("./pages/SetupGuide"));

import LoadingScreen from "./components/LoadingScreen";

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
            duration: 5000, // longer duration for success
            iconTheme: {
              primary: "green",
              secondary: "white",
            },
          },
          error: {
            duration: 5000, // longer duration for errors
            iconTheme: {
              primary: "red",
              secondary: "white",
            },
          },
        }}
      />
      <Router>
        <Suspense fallback={<LoadingScreen />}>
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

            <Route
              path="/setup-guide"
              element={
                <ProtectedRoute>
                  <SetupGuide />
                </ProtectedRoute>
              }
            />

            <Route path="/impressum" element={<Impressum />} />

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </div>
  );
};

export default App;
