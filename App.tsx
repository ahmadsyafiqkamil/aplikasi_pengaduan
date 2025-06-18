
import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { AppConfigProvider } from './hooks/useAppConfig';
import { ComplaintsProvider } from './hooks/useComplaints';
import Navbar from './components/layout/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import PublicComplaintPage from './pages/PublicComplaintPage';
import TrackComplaintPage from './pages/TrackComplaintPage'; // Added
import AdminDashboardPage from './pages/AdminDashboardPage';
import SupervisorDashboardPage from './pages/SupervisorDashboardPage';
import AgentDashboardPage from './pages/AgentDashboardPage';
import ManagementDashboardPage from './pages/ManagementDashboardPage';
import { UserRole } from './types';
import { ROLES_CONFIG } from './constants';


const ProtectedRoute: React.FC<{ allowedRoles: UserRole[] }> = ({ allowedRoles }) => {
  const { loggedInUser } = useAuth();
  const location = useLocation();

  if (!loggedInUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(loggedInUser.role)) {
    // Redirect to their default dashboard or landing page if role mismatch
    const userDefaultPath = ROLES_CONFIG[loggedInUser.role]?.path || '/';
    return <Navigate to={userDefaultPath} replace />;
  }

  return <Outlet />; // Render child routes
};

const AppContent: React.FC = () => {
  const { loggedInUser } = useAuth(); // useAuth can be called here because AppContent is child of AuthProvider
  return (
    <div className="min-h-screen flex flex-col bg-light-bg">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={loggedInUser ? <Navigate to={ROLES_CONFIG[loggedInUser.role]?.path || '/'} /> : <LoginPage />} />
          <Route path="/buat-pengaduan" element={<PublicComplaintPage />} />
          <Route path="/lacak-pengaduan" element={<TrackComplaintPage />} /> {/* Added route */}

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]} />}>
            <Route path={ROLES_CONFIG[UserRole.ADMIN].path} element={<AdminDashboardPage />} />
          </Route>

          {/* Supervisor Routes */}
          <Route element={<ProtectedRoute allowedRoles={[UserRole.SUPERVISOR]} />}>
            <Route path={ROLES_CONFIG[UserRole.SUPERVISOR].path} element={<SupervisorDashboardPage />} />
          </Route>

          {/* Agent Routes */}
          <Route element={<ProtectedRoute allowedRoles={[UserRole.AGENT]} />}>
            <Route path={ROLES_CONFIG[UserRole.AGENT].path} element={<AgentDashboardPage />} />
          </Route>

          {/* Management Routes */}
          <Route element={<ProtectedRoute allowedRoles={[UserRole.MANAGEMENT]} />}>
            <Route path={ROLES_CONFIG[UserRole.MANAGEMENT].path} element={<ManagementDashboardPage />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" />} /> {/* Fallback to landing page */}
        </Routes>
      </main>
    </div>
  );
}


const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppConfigProvider>
        <ComplaintsProvider>
          <HashRouter>
            <AppContent/>
          </HashRouter>
        </ComplaintsProvider>
      </AppConfigProvider>
    </AuthProvider>
  );
};

export default App;