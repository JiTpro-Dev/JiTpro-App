import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CompanyProvider } from './context/CompanyContext';
import { RequireAuth } from './auth/requireAuth';
import { Login } from './pages/Login';
import { ResetPassword } from './pages/ResetPassword';
import { Dashboard } from './pages/Dashboard';
import { ArchivedCompanies } from './pages/ArchivedCompanies';
import { Demo } from './pages/Demo';
import { ProjectDashboard } from './pages/ProjectDashboard';
import { ProjectInformation } from './pages/ProjectInformation';
import { ProcurementTimeline } from './pages/demos/ProcurementTimeline';
import { ViewProcurementTimeline } from './pages/demos/ViewProcurementTimeline';
import { ProcurementSchedule } from './pages/demos/ProcurementSchedule';
// Old wizard archived — new wizard lives at /setup
// import { CompanySetup } from './pages/CompanySetup';
import { AppShell } from './layouts/AppShell/AppShell';
import { CompanyHome } from './pages/app/CompanyHome';
import { SetupWizard } from './pages/setup/SetupWizard';
import { ProjectHome } from './pages/app/ProjectHome';
import { Projects } from './pages/app/Projects';
import { People } from './pages/app/People';
import { Organizations } from './pages/app/Organizations';
import { Directory } from './pages/app/Directory';
import { CostCodes } from './pages/app/CostCodes';
import { Calendars } from './pages/app/Calendars';
import { ProjectTemplates } from './pages/app/ProjectTemplates';
import { Billing } from './pages/app/Billing';
import { Settings } from './pages/app/Settings';
import { ScopeBuilder } from './pages/app/pre-bid/ScopeBuilder';
import { SelectionRegister } from './pages/app/pre-bid/SelectionRegister';
import { CreateProject } from './pages/app/CreateProject';
import { Team } from './pages/app/Team';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CompanyProvider>
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
            path="/archived"
            element={
              <RequireAuth>
                <ArchivedCompanies />
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
          {/* Old wizard archived — use /setup instead */}
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
            path="/setup"
            element={
              <RequireAuth>
                <SetupWizard />
              </RequireAuth>
            }
          />
          <Route
            path="/setup/:companyId"
            element={
              <RequireAuth>
                <SetupWizard />
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
            {/* Company-level pages */}
            <Route path="home" element={<CompanyHome />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/new" element={<CreateProject />} />
            <Route path="people" element={<People />} />
            <Route path="organizations" element={<Organizations />} />
            <Route path="directory" element={<Directory />} />
            <Route path="cost-codes" element={<CostCodes />} />
            <Route path="calendars" element={<Calendars />} />
            <Route path="project-templates" element={<ProjectTemplates />} />
            <Route path="billing" element={<Billing />} />
            <Route path="settings" element={<Settings />} />
            {/* Project-level pages */}
            <Route path="project/:projectId/home" element={<ProjectHome />} />
            <Route path="project/:projectId/scope-builder" element={<ScopeBuilder />} />
            <Route path="project/:projectId/selection-register" element={<SelectionRegister />} />
            <Route path="project/:projectId/team" element={<Team />} />
            <Route index element={<Navigate to="home" replace />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        </CompanyProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
