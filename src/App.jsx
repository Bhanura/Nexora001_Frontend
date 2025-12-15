import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// --- Pages ---
import Login from "./pages/Login"; 
import ClientDashboard from "./pages/ClientDashboard";

const SuperAdminConsole = () => <div className="p-10 text-2xl text-red-600 font-bold">👮 Super Admin Console (Connected!)</div>;

// --- Security Wrapper ---
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-10">Loading...</div>;
  
  if (!user) return <Navigate to="/login" />;
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If a Client tries to access Admin, send them to dashboard
    return <Navigate to="/dashboard" />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Client Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['client_admin', 'super_admin']}>
                <ClientDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Super Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <SuperAdminConsole />
              </ProtectedRoute>
            } 
          />

          {/* Default Redirect */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;