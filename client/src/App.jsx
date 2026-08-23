import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ConnectionProvider } from './context/ConnectionContext';
import { ChatProvider } from './context/ChatContext';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ChatWidget from './components/ChatWidget';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SkillMatch from './pages/SkillMatch';
import Opportunities from './pages/Opportunities';
import OpportunityDetails from './pages/OpportunityDetails';
import TeamForge from './pages/TeamForge';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import Network from './pages/Network';



// Protected Route Wrapper with Shared Layout
const ProtectedLayout = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500">Loading SkillBridge...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar onOpenMobileMenu={() => setSidebarOpen(true)} />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
};

// Public Route (Accessible when logged out, or redirect to dashboard if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <ConnectionProvider>
        <ChatProvider>
          <Router>
            <Routes>
              {/* Public Landing */}
              <Route
                path="/"
                element={
                  <div className="min-h-screen bg-slate-50 flex flex-col">
                    <Navbar />
                    <main className="flex-1">
                      <Home />
                    </main>
                  </div>
                }
              />

              {/* Auth Pages */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                }
              />

              {/* Protected Application Modules */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedLayout>
                    <Dashboard />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/messages"
                element={
                  <ProtectedLayout>
                    <Messages />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/messages/:id"
                element={
                  <ProtectedLayout>
                    <Messages />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/network"
                element={
                  <ProtectedLayout>
                    <Network />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/skillmatch"
                element={
                  <ProtectedLayout>
                    <SkillMatch />
                  </ProtectedLayout>
                }
              />

              <Route
                path="/opportunities"
                element={
                  <ProtectedLayout>
                    <Opportunities />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/opportunities/:id"
                element={
                  <ProtectedLayout>
                    <OpportunityDetails />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/teams"
                element={
                  <ProtectedLayout>
                    <TeamForge />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedLayout>
                    <Profile />
                  </ProtectedLayout>
                }
              />

              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <ChatWidget />
          </Router>
        </ChatProvider>
      </ConnectionProvider>
    </AuthProvider>
  );
}

export default App;

