import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  TextField, 
  Button, 
  Container, 
  Typography, 
  Box, 
  Alert,
  Paper,
  InputAdornment,
  IconButton,
  CircularProgress
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('employee');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { login, register, user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    // Frontend validation
    if (isRegister) {
      if (!name.trim()) {
        setError('Name is required');
        setSubmitting(false);
        return;
      }
      if (name.trim().length < 2) {
        setError('Name must be at least 2 characters');
        setSubmitting(false);
        return;
      }
    }

    if (!email.trim()) {
      setError('Email is required');
      setSubmitting(false);
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      setSubmitting(false);
      return;
    }

    if (!password) {
      setError('Password is required');
      setSubmitting(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setSubmitting(false);
      return;
    }

    try {
      if (isRegister) {
        await register(name.trim(), email.trim(), password, role);
        setSuccess('✅ Registered successfully! Please login.');
        setError('');
        // Reset form
        setName('');
        setEmail('');
        setPassword('');
        setRole('employee');
        setIsRegister(false);
      } else {
        await login(email.trim(), password);
        // Navigation will happen via useEffect when user state updates
      }
    } catch (err) {
      console.error('Login/Register error:', err);
      
      // Better error handling
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.data?.errors) {
        // Handle validation errors array from backend
        const errorMessages = err.response.data.errors.map(e => e.msg).join(', ');
        setError(errorMessages);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setError('');
    setSuccess('');
    setName('');
    setEmail('');
    setPassword('');
    setShowPassword(false);
  };

  // Show loading while checking auth
  if (loading) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ 
          mt: 8, 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh'
        }}>
          <CircularProgress size={60} />
          <Typography sx={{ mt: 2 }}>Loading...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ 
        mt: 8, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center' 
      }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
          {/* Header */}
          <Box textAlign="center" mb={3}>
            <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
              {isRegister ? 'Create Account' : 'Welcome Back'}
            </Typography>
            <Typography color="text.secondary">
              {isRegister 
                ? 'Sign up to get started with visitor management' 
                : 'Sign in to continue to your dashboard'}
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 2 }}
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}

          {/* Success Alert */}
          {success && (
            <Alert 
              severity="success" 
              sx={{ mb: 2 }}
              onClose={() => setSuccess('')}
            >
              {success}
            </Alert>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit}>
            {isRegister && (
              <>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  helperText="Name must be at least 2 characters"
                  disabled={submitting}
                  autoFocus={isRegister}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Role"
                  select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  SelectProps={{ native: true }}
                  helperText="Select your role in the organization"
                  disabled={submitting}
                >
                  <option value="employee">Employee</option>
                  <option value="security">Security</option>
                  <option value="admin">Admin</option>
                  <option value="visitor">Visitor</option>
                </TextField>
              </>
            )}
            
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              helperText={isRegister ? "We'll never share your email" : ""}
              disabled={submitting}
              autoFocus={!isRegister}
              autoComplete="email"
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              helperText="Minimum 6 characters"
              disabled={submitting}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={submitting}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            
            <Button 
              type="submit" 
              fullWidth 
              variant="contained" 
              size="large"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={20} /> : (isRegister ? <PersonAddIcon /> : <LoginIcon />)}
            >
              {submitting ? 'Please wait...' : (isRegister ? 'Create Account' : 'Sign In')}
            </Button>

            <Box textAlign="center">
              <Button 
                onClick={toggleMode} 
                fullWidth
                disabled={submitting}
                sx={{ textTransform: 'none' }}
              >
                {isRegister 
                  ? 'Already have an account? Sign In' 
                  : 'Need an account? Create One'}
              </Button>
            </Box>
          </Box>

          {/* Footer Info */}
          <Box mt={3} textAlign="center">
            <Typography variant="caption" color="text.secondary">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </Typography>
          </Box>
        </Paper>

        {/* Demo Credentials Info */}
        {!isRegister && (
          <Paper elevation={1} sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', width: '100%' }}>
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              <strong>Demo Credentials:</strong>
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              Admin: admin@example.com / admin123
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              Security: security@example.com / security123
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              Employee: employee@example.com / employee123
            </Typography>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default Login;