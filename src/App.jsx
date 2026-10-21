import React from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { signOut } from "firebase/auth";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { auth } from "./firebaseConfig";
import LoginPage from "./pages/LoginPage";
import SecurityDashboard from "./pages/SecurityDashboard";
import HostDashboard from "./pages/HostDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import WarehouseDashboard from "./pages/WarehouseDashboard";
const homeByRole = {
  security: "/security",
  employee: "/host",
  warehouse: "/warehouse",
  admin: "/admin",
};
const toastStyle = {
  background: "#0D0D0D",
  color: "#FFE135",
  border: "3px solid #FFE135",
  fontFamily: "'Space Grotesk', sans-serif",
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: ".04em",
  borderRadius: 0,
  boxShadow: "4px 4px 0 #FFE13566",
};
function LogoutButton() {
  const { currentUser } = useAuth();
  if (!currentUser) return null;
  return (
    <button
      onClick={() => signOut(auth)}
      style={{
        position: "fixed",
        left: "12px",
        bottom: "12px",
        zIndex: 9999,
        padding: "8px 14px",
        background: "#0D0D0D",
        color: "#FFE135",
        border: "3px solid #FFE135",
        borderRadius: 0,
        fontSize: "12px",
        fontWeight: 900,
        letterSpacing: ".08em",
        textTransform: "uppercase",
        fontFamily: "'Space Grotesk', sans-serif",
        cursor: "pointer",
      }}
    >
      Keluar
    </button>
  );
}
function NoAccess() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FFE135",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        textAlign: "center",
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      <div
        style={{
          background: "#F5F5F5",
          border: "4px solid #0D0D0D",
          boxShadow: "8px 8px 0 #0D0D0D",
          padding: "28px",
          maxWidth: "380px",
        }}
      >
        <div
          style={{
            fontSize: "20px",
            fontWeight: 900,
            textTransform: "uppercase",
          }}
        >
          Akun tidak memiliki akses
        </div>
        <p
          style={{
            fontWeight: 600,
            marginTop: "10px",
          }}
        >
          Akun ini belum diberi peran atau sudah dinonaktifkan. Hubungi administrator.
        </p>
      </div>
    </div>
  );
}
function resolveHome(currentUser, userProfile) {
  if (!currentUser) return "/login";
  if (userProfile?.aktif === false) return "/no-access";
  return homeByRole[userProfile?.role] || "/no-access";
}
function ProtectedRoute({ allowedRoles, children }) {
  const { currentUser, userProfile } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  const home = resolveHome(currentUser, userProfile);
  if (home === "/no-access" || !allowedRoles.includes(userProfile.role)) {
    return <Navigate to={home} replace />;
  }
  return children;
}
function AppRoutes() {
  const { currentUser, userProfile } = useAuth();
  const home = resolveHome(currentUser, userProfile);
  return (
    <Routes>
      <Route path="/login" element={currentUser ? <Navigate to={home} replace /> : <LoginPage />} />
      <Route
        path="/no-access"
        element={currentUser ? <NoAccess /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/security"
        element={
          <ProtectedRoute allowedRoles={["security", "admin"]}>
            <SecurityDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/host"
        element={
          <ProtectedRoute allowedRoles={["employee", "admin"]}>
            <HostDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/warehouse"
        element={
          <ProtectedRoute allowedRoles={["warehouse", "admin"]}>
            <WarehouseDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to={home} replace />} />
    </Routes>
  );
}
export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: toastStyle,
          }}
        />
        <AppRoutes />
        <LogoutButton />
      </AuthProvider>
    </HashRouter>
  );
}
