import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RequireAuth } from './auth/requireAuth';
import { Login } from './pages/Login';
import { ResetPassword } from './pages/ResetPassword';
import { Dashboard } from './pages/Dashboard';
import { Demo } from './pages/Demo';
import { ProjectDashboard } from './pages/ProjectDashboard';
import { ProjectInformation } from './pages/ProjectInformation';
import { ProcurementTimeline } from './pages/demos/ProcurementTimeline';
import { ViewProcurementTimeline } from './pages/demos/ViewProcurementTimeline';
import { ProcurementSchedule } from './pages/demos/ProcurementSchedule';
import { CompanySetup } from './pages/CompanySetup';
import { AppShell } from './layouts/AppShell/AppShell';
import { CompanyHome } from './pages/app/CompanyHome';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/demo"
            element={
              <RequireAuth>
                <Demo />
              </RequireAuth>
            }
          />
          <Route
            path="/demo/procurement-timeline"
            element={
              <RequireAuth>
                <ProcurementTimeline />
              </RequireAuth>
            }
          />
          <Route
            path="/demo/view-procurement-timeline"
            element={
              <RequireAuth>
                <ViewProcurementTimeline />
              </RequireAuth>
            }
          />
          <Route
            path="/demo/procurement-schedule"
            element={
              <RequireAuth>
                <ProcurementSchedule />
              </RequireAuth>
            }
          />
          <Route
            path="/company/setup"
            element={
              <RequireAuth>
                <CompanySetup />
              </RequireAuth>
            }
          />
          <Route
            path="/project/new"
            element={
              <RequireAuth>
                <ProjectInformation />
              </RequireAuth>
            }
          />
          <Route
            path="/project/:id"
            element={
              <RequireAuth>
                <ProjectDashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/app"
            element={
              <RequireAuth>
                <AppShell />
              </RequireAuth>
            }
          >
            <Route path="home" element={<CompanyHome />} />
            <Route index element={<Navigate to="home" replace />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
