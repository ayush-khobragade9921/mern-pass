import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Container, Typography, Button, Grid, Card, CardContent, Box, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  People as PeopleIcon,
  EventNote as EventNoteIcon,
  Badge as BadgeIcon,
  ExitToApp as ExitToAppIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  BarChart as BarChartIcon,
  Add as AddIcon
} from '@mui/icons-material';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [stats, setStats] = useState({
    visitors: 0,
    appointments: 0,
    passes: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [visitors, appointments, passes] = await Promise.all([
        api.get('/visitors').catch(() => ({ data: [] })),
        api.get('/appointments').catch(() => ({ data: [] })),
        api.get('/passes').catch(() => ({ data: [] }))
      ]);
      setStats({
        visitors: visitors.data.length || 0,
        appointments: appointments.data.length || 0,
        passes: passes.data.length || 0
      });
    } catch (err) {
      console.error('Stats fetch error:', err);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return <div>Loading...</div>;

  // ADMIN DASHBOARD
  if (user.role === 'admin') {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" gutterBottom fontWeight="bold">
              Admin Dashboard
            </Typography>
            <Typography color="text.secondary">
              Welcome back, {user.name}!
            </Typography>
          </Box>
          <Button onClick={handleLogout} variant="outlined" startIcon={<ExitToAppIcon />}>
            Logout
          </Button>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={4}>
            <Card elevation={3} sx={{ bgcolor: '#e3f2fd' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h6" color="text.secondary">Total Visitors</Typography>
                    <Typography variant="h3" fontWeight="bold" color="primary">
                      {stats.visitors}
                    </Typography>
                  </Box>
                  <PeopleIcon sx={{ fontSize: 60, color: '#1976d2', opacity: 0.7 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Card elevation={3} sx={{ bgcolor: '#f3e5f5' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h6" color="text.secondary">Appointments</Typography>
                    <Typography variant="h3" fontWeight="bold" color="secondary">
                      {stats.appointments}
                    </Typography>
                  </Box>
                  <EventNoteIcon sx={{ fontSize: 60, color: '#9c27b0', opacity: 0.7 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Card elevation={3} sx={{ bgcolor: '#e8f5e9' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h6" color="text.secondary">Passes Issued</Typography>
                    <Typography variant="h3" fontWeight="bold" color="success.main">
                      {stats.passes}
                    </Typography>
                  </Box>
                  <BadgeIcon sx={{ fontSize: 60, color: '#4caf50', opacity: 0.7 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={<PeopleIcon />}
                onClick={() => navigate('/visitors')}
                sx={{ py: 2 }}
              >
                Manage Visitors
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={<EventNoteIcon />}
                onClick={() => navigate('/appointments')}
                sx={{ py: 2 }}
              >
                Appointments
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={<BadgeIcon />}
                onClick={() => navigate('/passes')}
                sx={{ py: 2 }}
              >
                Manage Passes
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={<DashboardIcon />}
                onClick={() => navigate('/checkin')}
                sx={{ py: 2 }}
              >
                Check-In System
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    );
  }

  // SECURITY DASHBOARD
  if (user.role === 'security') {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" gutterBottom fontWeight="bold">
              Security Dashboard
            </Typography>
            <Typography color="text.secondary">
              Welcome, {user.name}!
            </Typography>
          </Box>
          <Button onClick={handleLogout} variant="outlined" startIcon={<ExitToAppIcon />}>
            Logout
          </Button>
        </Box>

        <Paper elevation={3} sx={{ p: 4, mb: 3, bgcolor: '#e3f2fd' }}>
          <Typography variant="h5" gutterBottom>
            🔒 Your Role: Security Officer
          </Typography>
          <Typography color="text.secondary" paragraph>
            You have access to visitor check-in/check-out system and pass verification.
          </Typography>
        </Paper>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Active Passes Today
                </Typography>
                <Typography variant="h3" color="success.main" fontWeight="bold">
                  {stats.passes}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Visitors
                </Typography>
                <Typography variant="h3" color="primary" fontWeight="bold">
                  {stats.visitors}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box mt={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                color="primary"
                startIcon={<DashboardIcon />}
                onClick={() => navigate('/checkin')}
                sx={{ py: 3 }}
              >
                Open Check-In System
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                variant="outlined"
                fullWidth
                size="large"
                startIcon={<BadgeIcon />}
                onClick={() => navigate('/passes')}
                sx={{ py: 3 }}
              >
                View All Passes
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Container>
    );
  }

  // EMPLOYEE DASHBOARD
  if (user.role === 'employee') {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" gutterBottom fontWeight="bold">
              Employee Dashboard
            </Typography>
            <Typography color="text.secondary">
              Welcome, {user.name}!
            </Typography>
          </Box>
          <Button onClick={handleLogout} variant="outlined" startIcon={<ExitToAppIcon />}>
            Logout
          </Button>
        </Box>

        <Paper elevation={3} sx={{ p: 4, mb: 3, bgcolor: '#f3e5f5' }}>
          <Typography variant="h5" gutterBottom>
            👤 Your Role: Employee
          </Typography>
          <Typography color="text.secondary" paragraph>
            You can manage your appointments and invite visitors.
          </Typography>
        </Paper>

        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  My Appointments
                </Typography>
                <Typography variant="h3" color="secondary" fontWeight="bold">
                  {stats.appointments}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  My Visitors
                </Typography>
                <Typography variant="h3" color="primary" fontWeight="bold">
                  {stats.visitors}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Typography variant="h5" gutterBottom fontWeight="bold">
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={<EventNoteIcon />}
              onClick={() => navigate('/appointments')}
              sx={{ py: 2 }}
            >
              My Appointments
            </Button>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={<PeopleIcon />}
              onClick={() => navigate('/visitors')}
              sx={{ py: 2 }}
            >
              Invite Visitors
            </Button>
          </Grid>
        </Grid>
      </Container>
    );
  }

  // VISITOR DASHBOARD
  if (user.role === 'visitor') {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" gutterBottom fontWeight="bold">
              Visitor Portal
            </Typography>
            <Typography color="text.secondary">
              Welcome, {user.name}!
            </Typography>
          </Box>
          <Button onClick={handleLogout} variant="outlined" startIcon={<ExitToAppIcon />}>
            Logout
          </Button>
        </Box>

        <Paper elevation={3} sx={{ p: 4, mb: 3, bgcolor: '#e8f5e9' }}>
          <Typography variant="h5" gutterBottom>
            🎫 Your Role: Visitor
          </Typography>
          <Typography color="text.secondary" paragraph>
            Request appointments, view your visit requests, and access your digital passes.
          </Typography>
        </Paper>

        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  My Visit Requests
                </Typography>
                <Typography variant="h3" color="primary" fontWeight="bold">
                  {stats.appointments}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Pending and approved visits
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  My Passes
                </Typography>
                <Typography variant="h3" color="success.main" fontWeight="bold">
                  {stats.passes}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Approved & active passes
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Typography variant="h5" gutterBottom fontWeight="bold">
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Button
              variant="contained"
              fullWidth
              size="large"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate('/request-visit')}
              sx={{ py: 2 }}
            >
              Request Visit
            </Button>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              variant="outlined"
              fullWidth
              size="large"
              startIcon={<EventNoteIcon />}
              onClick={() => navigate('/appointments')}
              sx={{ py: 2 }}
            >
              My Requests
            </Button>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              variant="outlined"
              fullWidth
              size="large"
              startIcon={<BadgeIcon />}
              onClick={() => navigate('/passes')}
              sx={{ py: 2 }}
            >
              My Passes
            </Button>
          </Grid>
        </Grid>

        <Paper elevation={1} sx={{ p: 3, mt: 4, bgcolor: '#e3f2fd' }}>
          <Typography variant="body1" fontWeight="bold" gutterBottom>
            📋 How it works:
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            • <strong>Request Visit:</strong> Submit a visit request with date, time, and purpose
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            • <strong>My Requests:</strong> Track status of your visit requests (Pending/Approved/Rejected)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • <strong>My Passes:</strong> Download approved passes and show at security desk
          </Typography>
        </Paper>
      </Container>
    );
  }

  // DEFAULT (shouldn't reach here)
  return (
    <Container>
      <Typography variant="h4">Dashboard</Typography>
      <Typography>Role: {user.role}</Typography>
      <Button onClick={handleLogout}>Logout</Button>
    </Container>
  );
};

export default Dashboard;