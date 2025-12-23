import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Visitors from './pages/Visitors';
import Appointments from './pages/Appointments';
import Passes from './pages/Passes';
import CheckIn from './pages/CheckIn';
import Requestvisit from './pages/Requestvisit';  // ← LOWERCASE

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Route - Login */}
          <Route path="/login" element={<Login />} />
          
          {/* Dashboard - All authenticated users */}
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          
          {/* Request Visit - Visitor role only (self-registration) */}
          <Route 
            path="/request-visit" 
            element={
              <PrivateRoute roles={['visitor']}>
                <Requestvisit />
              </PrivateRoute>
            } 
          />
          
          {/* Visitors - Admin, Security, Employee only (NOT Visitor role) */}
          <Route 
            path="/visitors" 
            element={
              <PrivateRoute roles={['admin', 'security', 'employee']}>
                <Visitors />
              </PrivateRoute>
            } 
          />
          
          {/* Appointments - All roles can view their own */}
          <Route 
            path="/appointments" 
            element={
              <PrivateRoute>
                <Appointments />
              </PrivateRoute>
            } 
          />
          
          {/* Passes - All roles (filtered by backend based on role) */}
          <Route 
            path="/passes" 
            element={
              <PrivateRoute>
                <Passes />
              </PrivateRoute>
            } 
          />
          
          {/* Check-In - Security and Admin only */}
          <Route 
            path="/checkin" 
            element={
              <PrivateRoute roles={['security', 'admin']}>
                <CheckIn />
              </PrivateRoute>
            } 
          />
          
          {/* Root Route - Redirect to Dashboard */}
          <Route 
            path="/" 
            element={<Navigate to="/dashboard" replace />} 
          />
          
          {/* Catch-all Route - Redirect to Dashboard */}
          <Route 
            path="*" 
            element={<Navigate to="/dashboard" replace />} 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;