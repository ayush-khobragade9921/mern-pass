import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Container, Typography, Paper, Box, Button } from '@mui/material';
import { Lock as LockIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  // Show loading state
  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6">Loading...</Typography>
        </Paper>
      </Container>
    );
  }

  // Not authenticated - redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  if (roles && !roles.includes(user.role)) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box textAlign="center" mb={3}>
            <LockIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom color="error">
              Access Denied
            </Typography>
            <Typography color="text.secondary" paragraph>
              You don't have permission to access this page.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              <strong>Your Role:</strong> {user.role}
              <br />
              <strong>Required Role:</strong> {roles.join(' or ')}
            </Typography>
          </Box>
          <Button
            variant="contained"
            fullWidth
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard
          </Button>
        </Paper>
      </Container>
    );
  }

  // User is authenticated and has correct role
  return children;
};

export default PrivateRoute;