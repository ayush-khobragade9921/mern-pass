import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  Grid,
  Card,
  CardContent,
  Button
} from '@mui/material';
import {
  PeopleAlt as PeopleAltIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import QRScanner from '../components/QRScanner';
import api from '../services/api';

const CheckIn = () => {
  const { user } = useContext(AuthContext);
  const [tabValue, setTabValue] = useState(0);
  const [activeVisitors, setActiveVisitors] = useState([]);
  const [completedVisitors, setCompletedVisitors] = useState([]);
  const [allLogs, setAllLogs] = useState([]);
  const [stats, setStats] = useState({
    today: 0,
    activeNow: 0,
    thisWeek: 0,
    thisMonth: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    fetchTodayCheckIns();
    fetchStats();
    fetchAllLogs();
  };

  const fetchTodayCheckIns = async () => {
    try {
      const res = await api.get('/checklogs/today');
      setActiveVisitors(res.data.checkLogs?.active || []);
      setCompletedVisitors(res.data.checkLogs?.completed || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching check-ins:', err);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/checklogs/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchAllLogs = async () => {
    try {
      const res = await api.get('/checklogs');
      setAllLogs(res.data);
    } catch (err) {
      console.error('Error fetching all logs:', err);
    }
  };

  const handleScanSuccess = (data) => {
    console.log('Scan successful:', data);
    fetchData(); // Refresh all data
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          🎫 Visitor Check-In/Out System
        </Typography>
        <Typography color="text.secondary" variant="body1">
          Security Officer: <strong>{user?.name}</strong>
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2} sx={{ bgcolor: '#e3f2fd' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Today's Total
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    {stats.today || 0}
                  </Typography>
                </Box>
                <PeopleAltIcon sx={{ fontSize: 50, color: '#1976d2', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2} sx={{ bgcolor: '#e8f5e9' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Currently Inside
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {stats.activeNow || 0}
                  </Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 50, color: '#4caf50', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2} sx={{ bgcolor: '#fff3e0' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    This Week
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {stats.thisWeek || 0}
                  </Typography>
                </Box>
                <ScheduleIcon sx={{ fontSize: 50, color: '#ff9800', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2} sx={{ bgcolor: '#f3e5f5' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    This Month
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="secondary.main">
                    {stats.thisMonth || 0}
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 50, color: '#9c27b0', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Scanner Tabs */}
      <Paper elevation={3}>
        <Tabs 
          value={tabValue} 
          onChange={(e, v) => setTabValue(v)} 
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="📥 Check-In Scanner" />
          <Tab label="📤 Check-Out Scanner" />
          <Tab label={`✅ Active (${activeVisitors.length})`} />
          <Tab label={`✔️ Completed (${completedVisitors.length})`} />
          <Tab label={`📊 All Logs (${allLogs.length})`} />
        </Tabs>
        
        <Box p={3}>
          {/* Check-In Scanner Tab */}
          {tabValue === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom color="primary">
                📥 Check-In Visitor with QR Code
              </Typography>
              <Typography color="text.secondary" paragraph>
                Scan the QR code from the visitor's pass to check them in
              </Typography>
              <QRScanner key={`checkin-${tabValue}`} mode="checkin" onScanSuccess={handleScanSuccess} />
            </Box>
          )}
          
          {/* Check-Out Scanner Tab */}
          {tabValue === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom color="secondary">
                📤 Check-Out Visitor with QR Code
              </Typography>
              <Typography color="text.secondary" paragraph>
                Scan the QR code from the visitor's pass to check them out
              </Typography>
             <QRScanner key={`checkout-${tabValue}`} mode="checkout" onScanSuccess={handleScanSuccess} />
            </Box>
          )}
          
          {/* Active Visitors Tab */}
          {tabValue === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom color="success.main">
                ✅ Currently Inside Building
              </Typography>
              <Typography color="text.secondary" paragraph mb={3}>
                {activeVisitors.length} {activeVisitors.length === 1 ? 'visitor is' : 'visitors are'} currently checked in
              </Typography>
              
              {loading ? (
                <Typography align="center" py={4}>Loading...</Typography>
              ) : activeVisitors.length === 0 ? (
                <Box textAlign="center" py={6}>
                  <PeopleAltIcon sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No visitors currently inside
                  </Typography>
                  <Typography color="text.secondary">
                    Scan QR codes to check in visitors
                  </Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                        <TableCell><strong>Visitor</strong></TableCell>
                        <TableCell><strong>Check-In Time</strong></TableCell>
                        <TableCell><strong>Duration</strong></TableCell>
                        <TableCell><strong>Location</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {activeVisitors.map((log) => {
                        const duration = Math.floor((new Date() - new Date(log.checkInTime)) / 60000);
                        return (
                          <TableRow key={log._id} hover>
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={2}>
                                <Avatar 
                                  src={log.visitor?.photo}
                                  sx={{ width: 50, height: 50 }}
                                >
                                  {log.visitor?.name?.charAt(0)}
                                </Avatar>
                                <Box>
                                  <Typography variant="body1" fontWeight="medium">
                                    {log.visitor?.name || 'Unknown'}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {log.visitor?.phone || 'N/A'}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {formatTime(log.checkInTime)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(log.checkInTime)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="primary" fontWeight="medium">
                                {Math.floor(duration / 60)}h {duration % 60}m
                              </Typography>
                            </TableCell>
                            <TableCell>{log.location || 'Main Entrance'}</TableCell>
                            <TableCell>
                              <Chip 
                                label="Inside" 
                                color="success" 
                                size="small"
                                icon={<CheckCircleIcon />}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}

          {/* Completed Visits Tab */}
          {tabValue === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                ✔️ Completed Visits Today
              </Typography>
              <Typography color="text.secondary" paragraph mb={3}>
                {completedVisitors.length} {completedVisitors.length === 1 ? 'visitor has' : 'visitors have'} completed their visit today
              </Typography>
              
              {loading ? (
                <Typography align="center" py={4}>Loading...</Typography>
              ) : completedVisitors.length === 0 ? (
                <Box textAlign="center" py={6}>
                  <ScheduleIcon sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No completed visits yet today
                  </Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                        <TableCell><strong>Visitor</strong></TableCell>
                        <TableCell><strong>Check-In</strong></TableCell>
                        <TableCell><strong>Check-Out</strong></TableCell>
                        <TableCell><strong>Duration</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {completedVisitors.map((log) => (
                        <TableRow key={log._id} hover>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={2}>
                              <Avatar 
                                src={log.visitor?.photo}
                                sx={{ width: 50, height: 50 }}
                              >
                                {log.visitor?.name?.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="body1" fontWeight="medium">
                                  {log.visitor?.name || 'Unknown'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {log.visitor?.phone || 'N/A'}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatTime(log.checkInTime)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {log.checkOutTime ? formatTime(log.checkOutTime) : 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="info.main" fontWeight="medium">
                              {log.duration ? `${Math.floor(log.duration / 60)}h ${log.duration % 60}m` : 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label="Completed" 
                              color="default" 
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}

          {/* All Logs Tab */}
          {tabValue === 4 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                📊 Complete Check-In/Out History
              </Typography>
              <Typography color="text.secondary" paragraph mb={3}>
                All visitor check-in and check-out records
              </Typography>
              
              {allLogs.length === 0 ? (
                <Box textAlign="center" py={6}>
                  <ScheduleIcon sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No logs available
                  </Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                        <TableCell><strong>Visitor</strong></TableCell>
                        <TableCell><strong>Check-In</strong></TableCell>
                        <TableCell><strong>Check-Out</strong></TableCell>
                        <TableCell><strong>Duration</strong></TableCell>
                        <TableCell><strong>Location</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {allLogs.map((log) => (
                        <TableRow key={log._id} hover>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Avatar 
                                src={log.visitor?.photo}
                                sx={{ width: 40, height: 40 }}
                              >
                                {log.visitor?.name?.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight="medium">
                                  {log.visitor?.name || 'Unknown'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {log.visitor?.phone || 'N/A'}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDateTime(log.checkInTime)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {log.checkOutTime ? formatDateTime(log.checkOutTime) : '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {log.duration ? (
                              <Typography variant="body2" color="info.main">
                                {Math.floor(log.duration / 60)}h {log.duration % 60}m
                              </Typography>
                            ) : (
                              <Typography variant="body2" color="success.main">
                                Active
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {log.location || 'Main Entrance'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {log.checkOutTime ? (
                              <Chip label="Completed" size="small" />
                            ) : (
                              <Chip label="Active" color="success" size="small" />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
        </Box>
      </Paper>

      {/* Refresh Button */}
      <Box mt={3} textAlign="center">
        <Button 
          variant="outlined" 
          onClick={fetchData}
        >
          🔄 Refresh All Data
        </Button>
      </Box>
    </Container>
  );
};

export default CheckIn;