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
  CircularProgress,
  Fade,
  Slide
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon,
  Security as SecurityIcon
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
        setName('');
        setEmail('');
        setPassword('');
        setRole('employee');
        setIsRegister(false);
      } else {
        await login(email.trim(), password);
      }
    } catch (err) {
      console.error('Login/Register error:', err);

      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.data?.errors) {
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

  if (loading) {
    return (
      <Box sx={{
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <Box textAlign="center">
          <CircularProgress size={60} sx={{ color: 'white' }} />
          <Typography sx={{ mt: 2, color: 'white' }}>Loading...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{
      width: '100vw',
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      overflow: 'auto',
      padding: '20px',
      '&::before': {
        content: '""',
        position: 'absolute',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.1)',
        top: '-200px',
        right: '-200px',
        animation: 'float 6s ease-in-out infinite',
        zIndex: 0
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.1)',
        bottom: '-100px',
        left: '-100px',
        animation: 'float 8s ease-in-out infinite',
        zIndex: 0
      },
      '@keyframes float': {
        '0%, 100%': { transform: 'translateY(0px)' },
        '50%': { transform: 'translateY(-20px)' }
      }
    }}>
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1, my: 'auto' }}>
        <Slide direction="down" in={true} timeout={500}>
          <Paper
            elevation={10}
            sx={{
              p: 5,
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              maxWidth: '500px',
              mx: 'auto'
            }}
          >
            {/* Logo/Icon */}
            <Box textAlign="center" mb={2}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  mb: 2,
                  boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)'
                }}
              >
                <SecurityIcon sx={{ fontSize: 40, color: 'white' }} />
              </Box>
              <Typography
                variant="h4"
                gutterBottom
                fontWeight="bold"
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                {isRegister ? 'Create Account' : 'Welcome Back'}
              </Typography>
              <Typography color="text.secondary">
                {isRegister
                  ? 'Sign up to get started with visitor management'
                  : 'Sign in to continue to your dashboard'}
              </Typography>
            </Box>

            {/* Error Alert */}
            <Fade in={!!error}>
              <Box>
                {error && (
                  <Alert
                    severity="error"
                    sx={{ mb: 2, borderRadius: 2 }}
                    onClose={() => setError('')}
                  >
                    {error}
                  </Alert>
                )}
              </Box>
            </Fade>

            {/* Success Alert */}
            <Fade in={!!success}>
              <Box>
                {success && (
                  <Alert
                    severity="success"
                    sx={{ mb: 2, borderRadius: 2 }}
                    onClose={() => setSuccess('')}
                  >
                    {success}
                  </Alert>
                )}
              </Box>
            </Fade>

            {/* Form */}
            <Box component="form" onSubmit={handleSubmit}>
              {isRegister && (
                <Fade in={isRegister} timeout={300}>
                  <Box>
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
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: '#667eea'
                          }
                        }
                      }}
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
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    >
                      <option value="employee">Employee</option>
                      <option value="security">Security</option>
                      <option value="admin">Admin</option>
                      <option value="visitor">Visitor</option>
                    </TextField>
                  </Box>
                </Fade>
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
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: '#667eea'
                    }
                  }
                }}
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
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
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
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)'
                  }
                }}
                disabled={submitting}
                startIcon={submitting ? <CircularProgress size={20} sx={{ color: 'white' }} /> : (isRegister ? <PersonAddIcon /> : <LoginIcon />)}
              >
                {submitting ? 'Please wait...' : (isRegister ? 'Create Account' : 'Sign In')}
              </Button>

              <Box textAlign="center">
                <Button
                  onClick={toggleMode}
                  fullWidth
                  disabled={submitting}
                  sx={{
                    textTransform: 'none',
                    color: '#667eea',
                    '&:hover': {
                      background: 'rgba(102, 126, 234, 0.1)'
                    }
                  }}
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
        </Slide>

       
        {!isRegister && (
          <Fade in={!isRegister} timeout={800}>
            <Paper
              elevation={5}
              sx={{
                mt: 2,
                p: 3,
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                borderRadius: 3,
                maxWidth: '500px',
                mx: 'auto'
              }}
            >
            </Paper>
          </Fade>
        )}
      </Container>
    </Box>
  );
};

export default Login;