// React 18 with jsx:react-jsx doesn't require explicit import
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import TicketsPage from "./pages/TicketsPage";
import TicketDetailPage from "./pages/TicketDetailPage";
import NewTicketPage from "./pages/NewTicketPage";
import NotificationsPage from "./pages/NotificationsPage";
import FileManagementPage from "./pages/FileManagementPage";
import UsersPage from "./pages/UsersPage";
import OAuthCallbackPage from "./pages/OAuthCallbackPage";
import SetupPasswordPage from "./pages/SetupPasswordPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { NotificationsProvider } from "./contexts/NotificationsContext";

function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <NotificationsProvider>
                  <Layout />
                </NotificationsProvider>
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="tickets" element={<TicketsPage />} />
            <Route path="tickets/new" element={<NewTicketPage />} />
            <Route path="tickets/:id" element={<TicketDetailPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="files" element={<FileManagementPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="setup-password" element={<SetupPasswordPage />} />
            <Route path="change-password" element={<ChangePasswordPage />} />
          </Route>
        </Routes>
        <Toaster position="top-right" />
      </div>
    </ErrorBoundary>
  );
}

export default App;
