import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Container, Typography, Button, Grid, Card, CardContent, Box, Paper, Avatar, Fade, Grow } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  People as PeopleIcon,
  EventNote as EventNoteIcon,
  Badge as BadgeIcon,
  ExitToApp as ExitToAppIcon,
  Dashboard as DashboardIcon,
  TrendingUp as TrendingUpIcon,
  QrCodeScanner as QrCodeScannerIcon,
  Description as DescriptionIcon,
  RequestPage as RequestPageIcon
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
      <Box sx={{ 
        width: '100vw',
        minHeight: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        overflow: 'auto',
        py: 4
      }}>
        <Container maxWidth="lg">
          <Fade in={true} timeout={500}>
            <Box>
              {/* Header */}
              <Paper 
                elevation={0}
                sx={{ 
                  p: 4, 
                  mb: 4,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    width: '200px',
                    height: '200px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    top: '-100px',
                    right: '-50px'
                  }
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center" position="relative" zIndex={1}>
                  <Box>
                    <Typography variant="h4" gutterBottom fontWeight="bold">
                      👑 Admin Dashboard
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9 }}>
                      Welcome back, {user.name}!
                    </Typography>
                  </Box>
                  <Button 
                    onClick={handleLogout} 
                    variant="outlined" 
                    startIcon={<ExitToAppIcon />}
                    sx={{
                      color: 'white',
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      '&:hover': {
                        borderColor: 'white',
                        background: 'rgba(255, 255, 255, 0.1)'
                      }
                    }}
                  >
                    Logout
                  </Button>
                </Box>
              </Paper>

              {/* Stats Cards */}
              <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={4}>
                  <Grow in={true} timeout={500}>
                    <Card 
                      elevation={5}
                      sx={{ 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-10px)',
                          boxShadow: '0 12px 30px rgba(102, 126, 234, 0.4)'
                        }
                      }}
                    >
                      <CardContent>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                          <Box>
                            <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1 }}>
                              Total Visitors
                            </Typography>
                            <Typography variant="h3" fontWeight="bold">
                              {stats.visitors}
                            </Typography>
                          </Box>
                          <Avatar sx={{ width: 60, height: 60, background: 'rgba(255, 255, 255, 0.2)' }}>
                            <PeopleIcon sx={{ fontSize: 30 }} />
                          </Avatar>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grow>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Grow in={true} timeout={700}>
                    <Card 
                      elevation={5}
                      sx={{ 
                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        color: 'white',
                        transition: 'transform 0.3s ease',
                        '&:hover': { transform: 'translateY(-10px)' }
                      }}
                    >
                      <CardContent>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                          <Box>
                            <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1 }}>
                              Appointments
                            </Typography>
                            <Typography variant="h3" fontWeight="bold">
                              {stats.appointments}
                            </Typography>
                          </Box>
                          <Avatar sx={{ width: 60, height: 60, background: 'rgba(255, 255, 255, 0.2)' }}>
                            <EventNoteIcon sx={{ fontSize: 30 }} />
                          </Avatar>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grow>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Grow in={true} timeout={900}>
                    <Card 
                      elevation={5}
                      sx={{ 
                        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                        color: 'white',
                        transition: 'transform 0.3s ease',
                        '&:hover': { transform: 'translateY(-10px)' }
                      }}
                    >
                      <CardContent>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                          <Box>
                            <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1 }}>
                              Passes Issued
                            </Typography>
                            <Typography variant="h3" fontWeight="bold">
                              {stats.passes}
                            </Typography>
                          </Box>
                          <Avatar sx={{ width: 60, height: 60, background: 'rgba(255, 255, 255, 0.2)' }}>
                            <BadgeIcon sx={{ fontSize: 30 }} />
                          </Avatar>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grow>
                </Grid>
              </Grid>

              {/* Quick Actions */}
              <Paper elevation={5} sx={{ p: 4, borderRadius: 3, background: 'rgba(255, 255, 255, 0.9)' }}>
                <Typography variant="h5" gutterBottom fontWeight="bold" mb={3}>
                  ⚡ Quick Actions
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button variant="contained" fullWidth size="large" startIcon={<PeopleIcon />} onClick={() => navigate('/visitors')}
                      sx={{ py: 2, borderRadius: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', '&:hover': { transform: 'translateY(-2px)' } }}>
                      Manage Visitors
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button variant="contained" fullWidth size="large" startIcon={<EventNoteIcon />} onClick={() => navigate('/appointments')}
                      sx={{ py: 2, borderRadius: 2, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', '&:hover': { transform: 'translateY(-2px)' } }}>
                      Appointments
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button variant="contained" fullWidth size="large" startIcon={<BadgeIcon />} onClick={() => navigate('/passes')}
                      sx={{ py: 2, borderRadius: 2, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', '&:hover': { transform: 'translateY(-2px)' } }}>
                      Manage Passes
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button variant="contained" fullWidth size="large" startIcon={<DashboardIcon />} onClick={() => navigate('/checkin')}
                      sx={{ py: 2, borderRadius: 2, background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', '&:hover': { transform: 'translateY(-2px)' } }}>
                      Check-In System
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Box>
          </Fade>
        </Container>
      </Box>
    );
  }

  // SECURITY DASHBOARD
  if (user.role === 'security') {
    return (
      <Box sx={{ width: '100vw', minHeight: '100vh', position: 'fixed', top: 0, left: 0, background: 'linear-gradient(135deg, #e0e7ff 0%, #cfe2ff 100%)', overflow: 'auto', py: 4 }}>
        <Container maxWidth="lg">
          <Fade in={true} timeout={500}>
            <Box>
              <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 3, background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', color: 'white' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h4" gutterBottom fontWeight="bold">🔒 Security Dashboard</Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9 }}>Welcome, {user.name}!</Typography>
                  </Box>
                  <Button onClick={handleLogout} variant="outlined" startIcon={<ExitToAppIcon />}
                    sx={{ color: 'white', borderColor: 'rgba(255, 255, 255, 0.5)', '&:hover': { borderColor: 'white', background: 'rgba(255, 255, 255, 0.1)' } }}>
                    Logout
                  </Button>
                </Box>
              </Paper>

              <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={6}>
                  <Grow in={true} timeout={500}>
                    <Card elevation={5} sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', '&:hover': { transform: 'translateY(-10px)' } }}>
                      <CardContent>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                          <Box>
                            <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1 }}>Active Passes</Typography>
                            <Typography variant="h3" fontWeight="bold">{stats.passes}</Typography>
                          </Box>
                          <Avatar sx={{ width: 60, height: 60, background: 'rgba(255, 255, 255, 0.2)' }}>
                            <BadgeIcon sx={{ fontSize: 30 }} />
                          </Avatar>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grow>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Grow in={true} timeout={700}>
                    <Card elevation={5} sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', '&:hover': { transform: 'translateY(-10px)' } }}>
                      <CardContent>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                          <Box>
                            <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1 }}>Total Visitors</Typography>
                            <Typography variant="h3" fontWeight="bold">{stats.visitors}</Typography>
                          </Box>
                          <Avatar sx={{ width: 60, height: 60, background: 'rgba(255, 255, 255, 0.2)' }}>
                            <PeopleIcon sx={{ fontSize: 30 }} />
                          </Avatar>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grow>
                </Grid>
              </Grid>

              <Paper elevation={5} sx={{ p: 4, borderRadius: 3, background: 'rgba(255, 255, 255, 0.9)' }}>
                <Typography variant="h5" gutterBottom fontWeight="bold" mb={3}>⚡ Quick Actions</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Button variant="contained" fullWidth size="large" startIcon={<QrCodeScannerIcon />} onClick={() => navigate('/checkin')}
                      sx={{ py: 3, borderRadius: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', '&:hover': { transform: 'translateY(-2px)' } }}>
                      Open QR Scanner
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Button variant="contained" fullWidth size="large" startIcon={<BadgeIcon />} onClick={() => navigate('/passes')}
                      sx={{ py: 3, borderRadius: 2, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', '&:hover': { transform: 'translateY(-2px)' } }}>
                      View All Passes
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Box>
          </Fade>
        </Container>
      </Box>
    );
  }

  // EMPLOYEE DASHBOARD
  if (user.role === 'employee') {
    return (
      <Box sx={{ width: '100vw', minHeight: '100vh', position: 'fixed', top: 0, left: 0, background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)', overflow: 'auto', py: 4 }}>
        <Container maxWidth="lg">
          <Fade in={true} timeout={500}>
            <Box>
              <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 3, background: 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)', color: 'white' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h4" gutterBottom fontWeight="bold">👤 Employee Dashboard</Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9 }}>Welcome, {user.name}!</Typography>
                  </Box>
                  <Button onClick={handleLogout} variant="outlined" startIcon={<ExitToAppIcon />}
                    sx={{ color: 'white', borderColor: 'rgba(255, 255, 255, 0.5)', '&:hover': { borderColor: 'white', background: 'rgba(255, 255, 255, 0.1)' } }}>
                    Logout
                  </Button>
                </Box>
              </Paper>

              <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={6}>
                  <Grow in={true} timeout={500}>
                    <Card elevation={5} sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', '&:hover': { transform: 'translateY(-10px)' } }}>
                      <CardContent>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                          <Box>
                            <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1 }}>My Appointments</Typography>
                            <Typography variant="h3" fontWeight="bold">{stats.appointments}</Typography>
                          </Box>
                          <Avatar sx={{ width: 60, height: 60, background: 'rgba(255, 255, 255, 0.2)' }}>
                            <EventNoteIcon sx={{ fontSize: 30 }} />
                          </Avatar>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grow>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Grow in={true} timeout={700}>
                    <Card elevation={5} sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', '&:hover': { transform: 'translateY(-10px)' } }}>
                      <CardContent>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                          <Box>
                            <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1 }}>Visitors</Typography>
                            <Typography variant="h3" fontWeight="bold">{stats.visitors}</Typography>
                          </Box>
                          <Avatar sx={{ width: 60, height: 60, background: 'rgba(255, 255, 255, 0.2)' }}>
                            <PeopleIcon sx={{ fontSize: 30 }} />
                          </Avatar>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grow>
                </Grid>
              </Grid>

              <Paper elevation={5} sx={{ p: 4, borderRadius: 3, background: 'rgba(255, 255, 255, 0.9)' }}>
                <Typography variant="h5" gutterBottom fontWeight="bold" mb={3}>⚡ Quick Actions</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Button variant="contained" fullWidth size="large" startIcon={<PeopleIcon />} onClick={() => navigate('/visitors')}
                      sx={{ py: 3, borderRadius: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', '&:hover': { transform: 'translateY(-2px)' } }}>
                      Manage Visitors
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Button variant="contained" fullWidth size="large" startIcon={<EventNoteIcon />} onClick={() => navigate('/appointments')}
                      sx={{ py: 3, borderRadius: 2, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', '&:hover': { transform: 'translateY(-2px)' } }}>
                      My Appointments
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Box>
          </Fade>
        </Container>
      </Box>
    );
  }

  // VISITOR DASHBOARD
  if (user.role === 'visitor') {
    return (
      <Box sx={{ width: '100vw', minHeight: '100vh', position: 'fixed', top: 0, left: 0, background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)', overflow: 'auto', py: 4 }}>
        <Container maxWidth="lg">
          <Fade in={true} timeout={500}>
            <Box>
              <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 3, background: 'linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)', color: 'white' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h4" gutterBottom fontWeight="bold">🎫 Visitor Portal</Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9 }}>Welcome, {user.name}!</Typography>
                  </Box>
                  <Button onClick={handleLogout} variant="outlined" startIcon={<ExitToAppIcon />}
                    sx={{ color: 'white', borderColor: 'rgba(255, 255, 255, 0.5)', '&:hover': { borderColor: 'white', background: 'rgba(255, 255, 255, 0.1)' } }}>
                    Logout
                  </Button>
                </Box>
              </Paper>

              <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={6}>
                  <Grow in={true} timeout={500}>
                    <Card elevation={5} sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', '&:hover': { transform: 'translateY(-10px)' } }}>
                      <CardContent>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                          <Box>
                            <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1 }}>My Requests</Typography>
                            <Typography variant="h3" fontWeight="bold">{stats.appointments}</Typography>
                          </Box>
                          <Avatar sx={{ width: 60, height: 60, background: 'rgba(255, 255, 255, 0.2)' }}>
                            <RequestPageIcon sx={{ fontSize: 30 }} />
                          </Avatar>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grow>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Grow in={true} timeout={700}>
                    <Card elevation={5} sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', '&:hover': { transform: 'translateY(-10px)' } }}>
                      <CardContent>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                          <Box>
                            <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1 }}>My Passes</Typography>
                            <Typography variant="h3" fontWeight="bold">{stats.passes}</Typography>
                          </Box>
                          <Avatar sx={{ width: 60, height: 60, background: 'rgba(255, 255, 255, 0.2)' }}>
                            <BadgeIcon sx={{ fontSize: 30 }} />
                          </Avatar>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grow>
                </Grid>
              </Grid>

              <Paper elevation={5} sx={{ p: 4, borderRadius: 3, background: 'rgba(255, 255, 255, 0.9)' }}>
                <Typography variant="h5" gutterBottom fontWeight="bold" mb={3}>⚡ Quick Actions</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Button variant="contained" fullWidth size="large" startIcon={<RequestPageIcon />} onClick={() => navigate('/request-visit')}
                      sx={{ py: 3, borderRadius: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', '&:hover': { transform: 'translateY(-2px)' } }}>
                      Request Visit
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Button variant="contained" fullWidth size="large" startIcon={<DescriptionIcon />} onClick={() => navigate('/appointments')}
                      sx={{ py: 3, borderRadius: 2, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', '&:hover': { transform: 'translateY(-2px)' } }}>
                      My Requests
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Button variant="contained" fullWidth size="large" startIcon={<BadgeIcon />} onClick={() => navigate('/passes')}
                      sx={{ py: 3, borderRadius: 2, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', '&:hover': { transform: 'translateY(-2px)' } }}>
                      My Passes
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Box>
          </Fade>
        </Container>
      </Box>
    );
  }

  return null;
};

export default Dashboard;