import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Login";
import ReportForm from "./pages/ReportForm";
import HRDashboard from "./pages/HRDashboard";
import Signup from "./pages/Signup";
import Layout from "./layout/Layout";
import HeadManagement from "./pages/HeadManagement";
import EmployeeManagement from "./pages/EmployeeManagement";
import { ThemeProvider } from "./hooks/ThemeProvider";

function PrivateRoute({ children, role }) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  if (!token) return <Navigate to="/" replace />;

  // Check if user has the required role
  if (role && role !== userRole) {
    // Redirect based on actual role instead of showing 404
    if (userRole === "hr") {
      return <Navigate to="/hr" replace />;
    } else if (userRole === "head") {
      return <Navigate to="/form" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            style: {
              background: "var(--surface)",
              color: "var(--text)",
              border: "1px solid var(--border-strong)",
              borderRadius: "10px",
              fontFamily: "var(--font-body)",
              fontSize: "13px",
              boxShadow: "var(--shadow-md)",
            },
            success: { iconTheme: { primary: "#2f7d5c", secondary: "#fff" } },
            error: { iconTheme: { primary: "#b3402e", secondary: "#fff" } },
          }}
        />
        <Routes>
          <Route path="/" element={<Login />} />

          {/* HR Routes - These come FIRST */}
          <Route
            path="/hr"
            element={
              <PrivateRoute role="hr">
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<HRDashboard />} />
            <Route path="heads" element={<HeadManagement />} />
            <Route path="signup" element={<Signup />} />
          </Route>

          {/* Head Routes - These come SECOND */}
          <Route
            path="/form"
            element={
              <PrivateRoute role="head">
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<ReportForm />} />
            <Route path="employees" element={<EmployeeManagement />} />
          </Route>

          {/* Catch-all redirect - This should be last */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
